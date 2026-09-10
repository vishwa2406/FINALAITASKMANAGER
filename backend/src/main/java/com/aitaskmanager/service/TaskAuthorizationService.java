package com.aitaskmanager.service;

import com.aitaskmanager.model.entity.Department;
import com.aitaskmanager.model.entity.Task;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.model.enums.Role;
import com.aitaskmanager.repository.DepartmentAssignmentRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskAuthorizationService {

    private final DepartmentAssignmentRuleRepository ruleRepository;

    /**
     * Checks if a user has permission to view a given task.
     */
    public boolean canUserViewTask(User user, Task task) {
        if (isAdminOrSuperAdmin(user)) return true;

        // Creator can view outgoing tasks
        if (task.getCreatedBy() != null && task.getCreatedBy().getId().equals(user.getId())) return true;

        // Assigned user can view incoming task
        if (task.getAssignedToUser() != null && task.getAssignedToUser().getId().equals(user.getId())) return true;

        // User belonging to assigned target department can view
        if (user.getDepartment() != null && task.getAssignedToDepartment() != null
                && task.getAssignedToDepartment().getId().equals(user.getDepartment().getId())) return true;

        // User belonging to creator department can view
        if (user.getDepartment() != null && task.getCreatedByDepartment() != null
                && task.getCreatedByDepartment().getId().equals(user.getDepartment().getId())) return true;

        return false;
    }

    /**
     * Verifies view permission and throws AccessDeniedException if unauthorized.
     */
    public void checkViewPermission(User user, Task task) {
        if (!canUserViewTask(user, task)) {
            log.warn("IDOR attempt: User {} (Dept: {}) tried to access Task {} belonging to Dept {}",
                    user.getEmail(), user.getDepartment() != null ? user.getDepartment().getCode() : "NONE",
                    task.getId(), task.getAssignedToDepartment() != null ? task.getAssignedToDepartment().getCode() : "NONE");
            throw new AccessDeniedException("You are not authorized to view this task");
        }
    }

    /**
     * Checks if user can submit task for review (Assignee or Assignee Department member).
     */
    public boolean canUserSubmitForReview(User user, Task task) {
        if (isAdminOrSuperAdmin(user)) return true;

        if (task.getAssignedToUser() != null && task.getAssignedToUser().getId().equals(user.getId())) return true;

        if (user.getDepartment() != null && task.getAssignedToDepartment() != null
                && task.getAssignedToDepartment().getId().equals(user.getDepartment().getId())) return true;

        return false;
    }

    /**
     * Checks if user has final approval authority (Creator, Manager in Creator Dept, or Admin).
     */
    public boolean canUserApproveTask(User user, Task task) {
        if (isAdminOrSuperAdmin(user)) return true;

        // Task Creator has approval authority
        if (task.getCreatedBy() != null && task.getCreatedBy().getId().equals(user.getId())) return true;

        // Department Manager of Creator Department has approval authority
        if (user.getRole() == Role.MANAGER && user.getDepartment() != null && task.getCreatedByDepartment() != null
                && task.getCreatedByDepartment().getId().equals(user.getDepartment().getId())) return true;

        return false;
    }

    /**
     * Checks if user has rejection authority (Creator or Admin).
     */
    public boolean canUserRejectTask(User user, Task task) {
        return canUserApproveTask(user, task);
    }

    /**
     * Validates if source user's department is allowed to assign tasks to target department.
     */
    public void validateDepartmentAssignment(User sourceUser, Department targetDept) {
        if (targetDept == null) return;

        if (isAdminOrSuperAdmin(sourceUser) || sourceUser.getDepartment() == null) return;

        Department sourceDept = sourceUser.getDepartment();

        // Same department assignment is always allowed
        if (sourceDept.getId().equals(targetDept.getId())) return;

        boolean allowed = ruleRepository.existsBySourceDepartmentIdAndTargetDepartmentIdAndActiveTrue(
                sourceDept.getId(), targetDept.getId());

        if (!allowed) {
            log.warn("Blocked department assignment: {} department tried to assign task to {} department",
                    sourceDept.getCode(), targetDept.getCode());
            throw new AccessDeniedException(String.format(
                    "%s department is not allowed to assign tasks to %s department",
                    sourceDept.getName(), targetDept.getName()));
        }
    }

    /**
     * Validates that target user belongs to target department.
     */
    public void validateUserDepartmentBelonging(User targetUser, Department targetDept) {
        if (targetUser == null || targetDept == null) return;

        if (targetUser.getDepartment() == null || !targetUser.getDepartment().getId().equals(targetDept.getId())) {
            throw new IllegalArgumentException(String.format(
                    "Selected user '%s' does not belong to target department '%s'",
                    targetUser.getFullName(), targetDept.getName()));
        }
    }

    private boolean isAdminOrSuperAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
    }
}
