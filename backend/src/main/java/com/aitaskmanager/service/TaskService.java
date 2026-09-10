package com.aitaskmanager.service;

import com.aitaskmanager.exception.ResourceNotFoundException;
import com.aitaskmanager.model.entity.Department;
import com.aitaskmanager.model.entity.Task;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.model.enums.Role;
import com.aitaskmanager.model.enums.TaskStatus;
import com.aitaskmanager.repository.DepartmentRepository;
import com.aitaskmanager.repository.TaskRepository;
import com.aitaskmanager.repository.UserRepository;
import com.aitaskmanager.view.dto.request.TaskFilterRequest;
import com.aitaskmanager.view.dto.request.TaskRequest;
import com.aitaskmanager.view.dto.request.TaskReviewRequest;
import com.aitaskmanager.view.dto.request.TaskStatusUpdateRequest;
import com.aitaskmanager.view.dto.response.DashboardStatsResponse;
import com.aitaskmanager.view.dto.response.PagedTaskResponse;
import com.aitaskmanager.view.dto.response.TaskCommentResponse;
import com.aitaskmanager.view.dto.response.TaskResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import com.aitaskmanager.model.enums.ActivityCategory;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final TaskAuthorizationService authorizationService;
    private final TaskAssignmentService assignmentService;
    private final ActivityLogService activityLogService;

    // ────────────────────────────────────────────────────────────
    // CREATE TASK WITH CROSS-DEPARTMENT ASSIGNMENT
    // ────────────────────────────────────────────────────────────
    public TaskResponse createTask(TaskRequest request, String userEmail) {
        User creator = findUserByEmail(userEmail);
        Department creatorDept = creator.getDepartment();

        Department targetDept = null;
        if (request.getAssignedToDepartmentId() != null) {
            targetDept = findDepartmentById(request.getAssignedToDepartmentId());
        } else {
            targetDept = creatorDept; // Default to creator's own department
        }

        User targetUser = null;
        if (request.getAssignedToUserId() != null) {
            targetUser = findUserById(request.getAssignedToUserId());
        }

        // Validate assignment rules & department belonging
        authorizationService.validateDepartmentAssignment(creator, targetDept);
        authorizationService.validateUserDepartmentBelonging(targetUser, targetDept);

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority())
                .category(request.getCategory())
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours())
                .actualHours(request.getActualHours())
                .tags(request.getTags())
                .createdBy(creator)
                .createdByDepartment(creatorDept)
                .assignedToDepartment(targetDept)
                .assignedToUser(targetUser)
                .assignedAt(LocalDateTime.now())
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created id={} by {} (Dept: {}) assigned to Dept: {}",
                saved.getId(), userEmail, creatorDept != null ? creatorDept.getCode() : "NONE",
                targetDept != null ? targetDept.getCode() : "NONE");

        // Record history event
        String actionDesc = String.format("Task created and assigned to %s department%s",
                targetDept != null ? targetDept.getName() : "unassigned",
                targetUser != null ? " (" + targetUser.getFullName() + ")" : "");
        assignmentService.recordHistory(saved, creator, "CREATED", null, saved.getStatus(), actionDesc);
        activityLogService.logActivity(creator, ActivityCategory.TASK, "TASK_CREATE", "TASK", saved.getId(), "Created task: " + saved.getTitle());

        return mapToResponse(saved, creator);
    }

    // ────────────────────────────────────────────────────────────
    // READ TASKS (INCOMING, OUTGOING, DEPARTMENT, WAITING_REVIEW)
    // ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public PagedTaskResponse getTasks(String userEmail, TaskFilterRequest filter) {
        User user = findUserByEmail(userEmail);
        Long uid = user.getId();
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : -1L;

        Sort sort = buildSort(filter.getSortBy(), filter.getSortDirection());
        Pageable pageable = PageRequest.of(
            Math.max(0, filter.getPage()),
            filter.getSize() > 0 ? filter.getSize() : 10,
            sort
        );

        String viewType = filter.getViewType() != null ? filter.getViewType().toUpperCase() : "INCOMING";

        Page<Task> page;
        switch (viewType) {
            case "OUTGOING":
                page = taskRepository.findOutgoingTasks(uid, filter.getStatus(), filter.getPriority(),
                        filter.getCategory(), filter.getSearchTerm(), pageable);
                break;
            case "WAITING_REVIEW":
                page = taskRepository.findTasksWaitingReview(uid, deptId, pageable);
                break;
            case "DEPARTMENT":
                page = taskRepository.findDepartmentTasks(deptId, filter.getStatus(), filter.getPriority(),
                        filter.getCategory(), filter.getSearchTerm(), pageable);
                break;
            case "ALL":
                if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN) {
                    page = taskRepository.findAll(pageable);
                } else {
                    page = taskRepository.findByUserId(uid, pageable);
                }
                break;
            case "INCOMING":
            default:
                page = taskRepository.findIncomingTasks(uid, deptId, filter.getStatus(), filter.getPriority(),
                        filter.getCategory(), filter.getSearchTerm(), pageable);
                break;
        }

        List<TaskResponse> tasks = page.getContent().stream()
                .map(t -> mapToResponse(t, user))
                .collect(Collectors.toList());

        return PagedTaskResponse.builder()
                .tasks(tasks)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    // ────────────────────────────────────────────────────────────
    // READ SINGLE TASK WITH IDOR CHECK
    // ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        authorizationService.checkViewPermission(user, task);
        return mapToResponse(task, user);
    }

    // ────────────────────────────────────────────────────────────
    // UPDATE TASK DETAILS & REASSIGNMENT
    // ────────────────────────────────────────────────────────────
    public TaskResponse updateTask(Long taskId, TaskRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        authorizationService.checkViewPermission(user, task);

        Department targetDept = task.getAssignedToDepartment();
        if (request.getAssignedToDepartmentId() != null) {
            targetDept = findDepartmentById(request.getAssignedToDepartmentId());
            authorizationService.validateDepartmentAssignment(user, targetDept);
        }

        User targetUser = task.getAssignedToUser();
        if (request.getAssignedToUserId() != null) {
            targetUser = findUserById(request.getAssignedToUserId());
            authorizationService.validateUserDepartmentBelonging(targetUser, targetDept);
        }

        TaskStatus oldStatus = task.getStatus();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setCategory(request.getCategory());
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setActualHours(request.getActualHours());
        task.setTags(request.getTags());
        task.setAssignedToDepartment(targetDept);
        task.setAssignedToUser(targetUser);

        if (request.getStatus() != null && request.getStatus() != oldStatus) {
            // Status transition check
            validateStatusTransition(user, task, oldStatus, request.getStatus());
            task.setStatus(request.getStatus());
        }

        Task updated = taskRepository.save(task);
        log.info("Task updated id={}", taskId);

        assignmentService.recordHistory(updated, user, "UPDATED", oldStatus, updated.getStatus(), "Task details updated");
        activityLogService.logActivity(user, ActivityCategory.TASK, "TASK_UPDATE", "TASK", updated.getId(), "Updated task details: " + updated.getTitle());

        return mapToResponse(updated, user);
    }

    // ────────────────────────────────────────────────────────────
    // WORKFLOW ACTION 1: SUBMIT FOR REVIEW (Assignee)
    // ────────────────────────────────────────────────────────────
    public TaskResponse submitForReview(Long taskId, String userEmail, TaskReviewRequest reviewRequest) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        authorizationService.checkViewPermission(user, task);

        if (!authorizationService.canUserSubmitForReview(user, task)) {
            throw new AccessDeniedException("Only assigned employees or department members can submit this task for review");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(TaskStatus.SUBMITTED_FOR_REVIEW);

        Task saved = taskRepository.save(task);
        String note = reviewRequest != null && reviewRequest.getComment() != null ? reviewRequest.getComment() : "Submitted task for completion review";
        assignmentService.recordHistory(saved, user, "SUBMITTED_FOR_REVIEW", oldStatus, TaskStatus.SUBMITTED_FOR_REVIEW, note);
        activityLogService.logActivity(user, ActivityCategory.TASK, "TASK_SUBMIT_REVIEW", "TASK", saved.getId(), "Submitted task for review: " + saved.getTitle());

        log.info("Task {} submitted for review by {}", taskId, userEmail);
        return mapToResponse(saved, user);
    }

    // ────────────────────────────────────────────────────────────
    // WORKFLOW ACTION 2: APPROVE COMPLETION (Task Creator / Admin ONLY)
    // ────────────────────────────────────────────────────────────
    public TaskResponse approveCompletion(Long taskId, String userEmail, TaskReviewRequest reviewRequest) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!authorizationService.canUserApproveTask(user, task)) {
            throw new AccessDeniedException("Only the task creator or system admin has authority to approve task completion");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);
        String note = reviewRequest != null && reviewRequest.getComment() != null ? reviewRequest.getComment() : "Approved task completion";
        assignmentService.recordHistory(saved, user, "APPROVED", oldStatus, TaskStatus.COMPLETED, note);
        activityLogService.logActivity(user, ActivityCategory.TASK, "TASK_APPROVE", "TASK", saved.getId(), "Approved task completion: " + saved.getTitle());

        log.info("Task {} completion APPROVED by creator {}", taskId, userEmail);
        return mapToResponse(saved, user);
    }

    // ────────────────────────────────────────────────────────────
    // WORKFLOW ACTION 3: REJECT COMPLETION (Task Creator / Admin ONLY)
    // ────────────────────────────────────────────────────────────
    public TaskResponse rejectCompletion(Long taskId, String userEmail, TaskReviewRequest reviewRequest) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!authorizationService.canUserRejectTask(user, task)) {
            throw new AccessDeniedException("Only the task creator or system admin has authority to reject task completion");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(TaskStatus.REJECTED);

        Task saved = taskRepository.save(task);
        String note = reviewRequest != null && reviewRequest.getComment() != null ? reviewRequest.getComment() : "Task completion rejected. Re-opened for revisions.";
        assignmentService.recordHistory(saved, user, "REJECTED", oldStatus, TaskStatus.REJECTED, note);
        activityLogService.logActivity(user, ActivityCategory.TASK, "TASK_REJECT", "TASK", saved.getId(), "Rejected task completion: " + saved.getTitle());

        log.info("Task {} completion REJECTED by creator {}", taskId, userEmail);
        return mapToResponse(saved, user);
    }

    // ────────────────────────────────────────────────────────────
    // UPDATE STATUS ONLY (PATCH)
    // ────────────────────────────────────────────────────────────
    public TaskResponse updateTaskStatus(Long taskId, TaskStatusUpdateRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        authorizationService.checkViewPermission(user, task);
        TaskStatus oldStatus = task.getStatus();
        TaskStatus newStatus = request.getStatus();

        if (newStatus == TaskStatus.SUBMITTED_FOR_REVIEW) {
            return submitForReview(taskId, userEmail, new TaskReviewRequest("Submitted for review"));
        } else if (newStatus == TaskStatus.COMPLETED) {
            return approveCompletion(taskId, userEmail, new TaskReviewRequest("Directly marked as completed"));
        } else if (newStatus == TaskStatus.REJECTED) {
            return rejectCompletion(taskId, userEmail, new TaskReviewRequest("Directly rejected"));
        }

        validateStatusTransition(user, task, oldStatus, newStatus);
        task.setStatus(newStatus);
        Task updated = taskRepository.save(task);

        assignmentService.recordHistory(updated, user, "STATUS_CHANGED", oldStatus, newStatus, "Status updated to " + newStatus);
        activityLogService.logActivity(user, ActivityCategory.TASK, "TASK_STATUS_CHANGE", "TASK", updated.getId(), "Task status updated from " + oldStatus + " to " + newStatus);
        return mapToResponse(updated, user);
    }

    // ────────────────────────────────────────────────────────────
    // DELETE TASK (Creator / Admin ONLY)
    // ────────────────────────────────────────────────────────────
    public void deleteTask(Long taskId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!authorizationService.canUserApproveTask(user, task)) {
            throw new AccessDeniedException("Only the task creator or admin can delete this task");
        }

        taskRepository.delete(task);
        activityLogService.logActivity(user, ActivityCategory.TASK, "TASK_DELETE", "TASK", taskId, "Deleted task: " + task.getTitle());
        log.info("Task deleted id={} by {}", taskId, userEmail);
    }

    public TaskCommentResponse addComment(Long taskId, String userEmail, String commentText) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        authorizationService.checkViewPermission(user, task);
        activityLogService.logActivity(user, ActivityCategory.TASK, "TASK_COMMENT_ADD", "TASK", taskId, "Added comment on task: " + task.getTitle());
        return assignmentService.addComment(task, user, commentText);
    }

    // ────────────────────────────────────────────────────────────
    // DASHBOARD STATS
    // ────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String userEmail) {
        User user = findUserByEmail(userEmail);
        Long uid = user.getId();
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : -1L;
        LocalDate today = LocalDate.now();

        long total = taskRepository.countByUserId(uid);
        long completed = taskRepository.countByUserIdAndStatus(uid, TaskStatus.COMPLETED);
        long inProg = taskRepository.countByUserIdAndStatus(uid, TaskStatus.IN_PROGRESS);
        long todo = taskRepository.countByUserIdAndStatus(uid, TaskStatus.TODO);
        long submitted = taskRepository.countByUserIdAndStatus(uid, TaskStatus.SUBMITTED_FOR_REVIEW);
        long cancelled = taskRepository.countByUserIdAndStatus(uid, TaskStatus.CANCELLED);

        long incomingCount = taskRepository.countIncomingTasks(uid, deptId);
        long outgoingCount = taskRepository.countOutgoingTasks(uid);
        long waitingReviewCount = taskRepository.countWaitingReviewTasks(uid, deptId);

        List<TaskResponse> dueSoon = taskRepository
            .findTasksDueSoon(uid, today, today.plusDays(7))
            .stream().map(t -> mapToResponse(t, user)).collect(Collectors.toList());

        List<TaskResponse> overdue = taskRepository
            .findOverdueTasks(uid, today)
            .stream().map(t -> mapToResponse(t, user)).collect(Collectors.toList());

        double rate = total > 0 ? Math.round((double) completed / total * 1000.0) / 10.0 : 0;

        return DashboardStatsResponse.builder()
                .total(total)
                .completed(completed)
                .inProgress(inProg)
                .todo(todo)
                .submittedForReview(submitted)
                .cancelled(cancelled)
                .incomingCount(incomingCount)
                .outgoingCount(outgoingCount)
                .waitingReviewCount(waitingReviewCount)
                .dueSoon(dueSoon)
                .overdue(overdue)
                .completionRate(rate)
                .build();
    }

    // ────────────────────────────────────────────────────────────
    // MAPPER: Task Entity -> View DTO
    // ────────────────────────────────────────────────────────────
    public TaskResponse mapToResponse(Task task) {
        return mapToResponse(task, null);
    }

    public TaskResponse mapToResponse(Task task, User currentUser) {
        LocalDate today = LocalDate.now();

        boolean overdue = task.getDueDate() != null
            && task.getDueDate().isBefore(today)
            && task.getStatus() != TaskStatus.COMPLETED
            && task.getStatus() != TaskStatus.CANCELLED;

        Long daysUntilDue = task.getDueDate() != null
            ? ChronoUnit.DAYS.between(today, task.getDueDate()) : null;

        boolean canApprove = currentUser != null && authorizationService.canUserApproveTask(currentUser, task);
        boolean canSubmit = currentUser != null && authorizationService.canUserSubmitForReview(currentUser, task);

        User creator = task.getCreatedBy();
        Department creatorDept = task.getCreatedByDepartment();
        Department assignedDept = task.getAssignedToDepartment();
        User assignedUser = task.getAssignedToUser();

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .category(task.getCategory())
                .dueDate(task.getDueDate())
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .tags(task.getTags())
                .aiSuggestion(task.getAiSuggestion())
                .aiAnalyzed(task.getAiAnalyzed())
                .userId(assignedUser != null ? assignedUser.getId() : (creator != null ? creator.getId() : null))
                .createdByUserId(creator != null ? creator.getId() : null)
                .createdByUserName(creator != null ? creator.getFullName() : null)
                .createdByDepartmentId(creatorDept != null ? creatorDept.getId() : null)
                .createdByDepartmentName(creatorDept != null ? creatorDept.getName() : null)
                .assignedToDepartmentId(assignedDept != null ? assignedDept.getId() : null)
                .assignedToDepartmentName(assignedDept != null ? assignedDept.getName() : null)
                .assignedToUserId(assignedUser != null ? assignedUser.getId() : null)
                .assignedToUserName(assignedUser != null ? assignedUser.getFullName() : null)
                .assignedAt(task.getAssignedAt())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .isOverdue(overdue)
                .daysUntilDue(daysUntilDue)
                .canApprove(canApprove)
                .canSubmit(canSubmit)
                .build();
    }

    private void validateStatusTransition(User user, Task task, TaskStatus oldStatus, TaskStatus newStatus) {
        if (newStatus == TaskStatus.COMPLETED && !authorizationService.canUserApproveTask(user, task)) {
            throw new AccessDeniedException("Only the task creator can approve task completion. Please submit for review.");
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    private Department findDepartmentById(Long deptId) {
        return departmentRepository.findById(deptId)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + deptId));
    }

    private Sort buildSort(String sortBy, String dir) {
        if (sortBy == null || sortBy.isBlank()) sortBy = "createdAt";
        Sort.Direction direction = "ASC".equalsIgnoreCase(dir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, sortBy);
    }
}
