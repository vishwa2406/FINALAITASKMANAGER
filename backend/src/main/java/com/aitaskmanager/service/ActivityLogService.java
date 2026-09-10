package com.aitaskmanager.service;

import com.aitaskmanager.model.entity.ActivityLog;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.model.enums.ActivityCategory;
import com.aitaskmanager.repository.ActivityLogRepository;
import com.aitaskmanager.view.dto.request.ActivityFilterRequest;
import com.aitaskmanager.view.dto.response.ActivityLogResponse;
import com.aitaskmanager.view.dto.response.PagedTaskResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ============================================================
 * SERVICE — Activity Audit Log Service
 * ============================================================
 * Centralized service to log, query, and audit user & system activity.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void logActivity(User user, String userEmail, String userName, ActivityCategory category,
                            String action, String entityType, Long entityId, String details, String ipAddress) {
        try {
            ActivityLog activity = ActivityLog.builder()
                    .user(user)
                    .userEmail(user != null ? user.getEmail() : userEmail)
                    .userName(user != null ? user.getFullName() : (userName != null ? userName : "System/Guest"))
                    .action(action)
                    .actionCategory(category)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            activityLogRepository.save(activity);
            log.debug("Recorded activity: [{}] {} - {}", category, action, details);
        } catch (Exception e) {
            log.error("Failed to log activity event: {}", e.getMessage());
        }
    }

    public void logActivity(User user, ActivityCategory category, String action, String entityType, Long entityId, String details) {
        logActivity(user, user != null ? user.getEmail() : null, user != null ? user.getFullName() : null,
                category, action, entityType, entityId, details, "127.0.0.1");
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> getActivities(ActivityFilterRequest filter) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(filter.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = filter.getSortBy() != null && !filter.getSortBy().isBlank() ? filter.getSortBy() : "createdAt";
        Pageable pageable = PageRequest.of(Math.max(0, filter.getPage()), filter.getSize() > 0 ? filter.getSize() : 15, Sort.by(direction, sortBy));

        Page<ActivityLog> page = activityLogRepository.findActivities(
                filter.getCategory(),
                filter.getUserEmail(),
                filter.getSearch(),
                filter.getStartDate(),
                filter.getEndDate(),
                pageable
        );

        return page.map(this::mapToResponse);
    }

    public ActivityLogResponse mapToResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUserEmail())
                .userName(log.getUserName())
                .action(log.getAction())
                .actionCategory(log.getActionCategory())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
