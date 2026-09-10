package com.aitaskmanager.view.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

/**
 * View layer DTO for GET /api/auth/me.
 * Combines User model fields with computed task statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private LocalDateTime createdAt;
    private Long totalTasks;
    private Long completedTasks;
    private Long pendingTasks;
    private Long incomingTasks;
    private Long outgoingTasks;
    private Long waitingReviewTasks;
}
