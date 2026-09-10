package com.aitaskmanager.controller;

import com.aitaskmanager.model.enums.TaskPriority;
import com.aitaskmanager.model.enums.TaskStatus;
import com.aitaskmanager.service.TaskAssignmentService;
import com.aitaskmanager.service.TaskService;
import com.aitaskmanager.view.dto.request.*;
import com.aitaskmanager.view.dto.response.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;
    private final TaskAssignmentService assignmentService;

    /** GET /api/tasks?viewType=INCOMING&searchTerm=&status=&priority=&page=0&size=10 */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedTaskResponse>> getTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String viewType,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateTo,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        TaskFilterRequest filter = TaskFilterRequest.builder()
                .viewType(viewType)
                .searchTerm(searchTerm).status(status).priority(priority)
                .category(category).dueDateFrom(dueDateFrom).dueDateTo(dueDateTo)
                .page(page).size(size).sortBy(sortBy).sortDirection(sortDirection)
                .build();

        PagedTaskResponse result = taskService.getTasks(userDetails.getUsername(), filter);
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched", result));
    }

    /** GET /api/tasks/incoming */
    @GetMapping("/incoming")
    public ResponseEntity<ApiResponse<PagedTaskResponse>> getIncomingTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        TaskFilterRequest filter = TaskFilterRequest.builder()
                .viewType("INCOMING").page(page).size(size).build();
        PagedTaskResponse result = taskService.getTasks(userDetails.getUsername(), filter);
        return ResponseEntity.ok(ApiResponse.success("Incoming tasks fetched", result));
    }

    /** GET /api/tasks/outgoing */
    @GetMapping("/outgoing")
    public ResponseEntity<ApiResponse<PagedTaskResponse>> getOutgoingTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        TaskFilterRequest filter = TaskFilterRequest.builder()
                .viewType("OUTGOING").page(page).size(size).build();
        PagedTaskResponse result = taskService.getTasks(userDetails.getUsername(), filter);
        return ResponseEntity.ok(ApiResponse.success("Outgoing tasks fetched", result));
    }

    /** GET /api/tasks/department */
    @GetMapping("/department")
    public ResponseEntity<ApiResponse<PagedTaskResponse>> getDepartmentTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        TaskFilterRequest filter = TaskFilterRequest.builder()
                .viewType("DEPARTMENT").page(page).size(size).build();
        PagedTaskResponse result = taskService.getTasks(userDetails.getUsername(), filter);
        return ResponseEntity.ok(ApiResponse.success("Department tasks fetched", result));
    }

    /** GET /api/tasks/waiting-review */
    @GetMapping("/waiting-review")
    public ResponseEntity<ApiResponse<PagedTaskResponse>> getWaitingReviewTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        TaskFilterRequest filter = TaskFilterRequest.builder()
                .viewType("WAITING_REVIEW").page(page).size(size).build();
        PagedTaskResponse result = taskService.getTasks(userDetails.getUsername(), filter);
        return ResponseEntity.ok(ApiResponse.success("Waiting review tasks fetched", result));
    }

    /** GET /api/tasks/dashboard */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardStatsResponse stats = taskService.getDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dashboard fetched", stats));
    }

    /** GET /api/tasks/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.getTaskById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task fetched", task));
    }

    /** POST /api/tasks */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.createTask(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Task created successfully", task));
    }

    /** PUT /api/tasks/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.updateTask(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", task));
    }

    /** PATCH /api/tasks/{id}/status */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.updateTaskStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated", task));
    }

    /** PATCH /api/tasks/{id}/submit-review — Assignee submits task for review */
    @PatchMapping("/{id}/submit-review")
    public ResponseEntity<ApiResponse<TaskResponse>> submitForReview(
            @PathVariable Long id,
            @RequestBody(required = false) TaskReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.submitForReview(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Task submitted for completion review", task));
    }

    /** PATCH /api/tasks/{id}/approve — Creator approves task completion */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<TaskResponse>> approveCompletion(
            @PathVariable Long id,
            @RequestBody(required = false) TaskReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.approveCompletion(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Task completion approved", task));
    }

    /** PATCH /api/tasks/{id}/reject — Creator rejects completion and re-opens task */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<TaskResponse>> rejectCompletion(
            @PathVariable Long id,
            @RequestBody(required = false) TaskReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.rejectCompletion(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Task completion rejected", task));
    }

    /** POST /api/tasks/{id}/comments */
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<TaskCommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TaskCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskCommentResponse commentResp = taskService.addComment(id, userDetails.getUsername(), request.getComment());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", commentResp));
    }

    /** GET /api/tasks/{id}/comments */
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<TaskCommentResponse>>> getComments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.getTaskById(id, userDetails.getUsername()); // IDOR check
        List<TaskCommentResponse> comments = assignmentService.getTaskComments(id);
        return ResponseEntity.ok(ApiResponse.success("Comments fetched", comments));
    }

    /** GET /api/tasks/{id}/history */
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<TaskHistoryResponse>>> getHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.getTaskById(id, userDetails.getUsername()); // IDOR check
        List<TaskHistoryResponse> history = assignmentService.getTaskHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Task history fetched", history));
    }

    /** DELETE /api/tasks/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }
}
