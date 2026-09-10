package com.aitaskmanager.service;

import com.aitaskmanager.exception.ResourceNotFoundException;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.model.enums.ActivityCategory;
import com.aitaskmanager.model.enums.Role;
import com.aitaskmanager.model.enums.TaskStatus;
import com.aitaskmanager.repository.ActivityLogRepository;
import com.aitaskmanager.repository.TaskRepository;
import com.aitaskmanager.repository.UserRepository;
import com.aitaskmanager.view.dto.response.AdminOverviewStatsResponse;
import com.aitaskmanager.view.dto.response.UserAdminResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ============================================================
 * SERVICE — Admin Management Service
 * ============================================================
 * Business logic for admin stats, user management, and role updates.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public AdminOverviewStatsResponse getOverviewStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getActive())).count();
        long adminUsers = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.SUPER_ADMIN).count();

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.findAll().stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long inProgressTasks = taskRepository.findAll().stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        
        LocalDate today = LocalDate.now();
        long overdueTasks = taskRepository.findAll().stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today) && t.getStatus() != TaskStatus.COMPLETED && t.getStatus() != TaskStatus.CANCELLED)
                .count();

        long totalActivities = activityLogRepository.count();
        long activitiesToday = activityLogRepository.countByCreatedAtAfter(LocalDateTime.of(today, LocalTime.MIDNIGHT));

        Map<String, Long> categoryBreakdown = new HashMap<>();
        List<Object[]> groups = activityLogRepository.countActivitiesByCategoryGroup();
        for (Object[] row : groups) {
            ActivityCategory cat = (ActivityCategory) row[0];
            Long count = (Long) row[1];
            categoryBreakdown.put(cat.name(), count);
        }

        return AdminOverviewStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .adminUsers(adminUsers)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .overdueTasks(overdueTasks)
                .totalActivities(totalActivities)
                .activitiesToday(activitiesToday)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<UserAdminResponse> getUsersList(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), size > 0 ? size : 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage;
        if (search != null && !search.isBlank()) {
            userPage = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return userPage.map(this::mapToUserAdminResponse);
    }

    public UserAdminResponse updateUserRole(Long userId, Role newRole, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Role oldRole = targetUser.getRole();
        targetUser.setRole(newRole);
        User updated = userRepository.save(targetUser);

        String details = String.format("User %s (%s) role updated from %s to %s", updated.getFullName(), updated.getEmail(), oldRole, newRole);
        activityLogService.logActivity(admin, ActivityCategory.ADMIN, "USER_ROLE_UPDATED", "USER", userId, details);

        log.info("Admin {} updated role for user {} to {}", adminEmail, userId, newRole);
        return mapToUserAdminResponse(updated);
    }

    public UserAdminResponse toggleUserStatus(Long userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        boolean newStatus = !Boolean.TRUE.equals(targetUser.getActive());
        targetUser.setActive(newStatus);
        User updated = userRepository.save(targetUser);

        String details = String.format("User %s (%s) active status set to %s", updated.getFullName(), updated.getEmail(), newStatus);
        activityLogService.logActivity(admin, ActivityCategory.ADMIN, "USER_STATUS_TOGGLED", "USER", userId, details);

        log.info("Admin {} toggled active status for user {} to {}", adminEmail, userId, newStatus);
        return mapToUserAdminResponse(updated);
    }

    private UserAdminResponse mapToUserAdminResponse(User user) {
        long createdCount = taskRepository.findAll().stream().filter(t -> t.getCreatedBy() != null && t.getCreatedBy().getId().equals(user.getId())).count();
        long assignedCount = taskRepository.findAll().stream().filter(t -> t.getAssignedToUser() != null && t.getAssignedToUser().getId().equals(user.getId())).count();

        return UserAdminResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.getActive())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .departmentCode(user.getDepartment() != null ? user.getDepartment().getCode() : null)
                .totalTasksCreated(createdCount)
                .totalTasksAssigned(assignedCount)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
