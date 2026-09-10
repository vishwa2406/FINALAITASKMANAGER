package com.aitaskmanager.view.dto.response;

import com.aitaskmanager.model.enums.TaskPriority;
import com.aitaskmanager.model.enums.TaskStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================
 * VIEW LAYER — Response DTO
 * ============================================================
 * Shape of a Task as seen by the client. Includes computed
 * fields (isOverdue, daysUntilDue) that don't exist in the
 * Model — they're calculated by the Service when building
 * this View object, which is exactly where that kind of
 * presentation logic belongs.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private String category;
    private LocalDate dueDate;
    private Double estimatedHours;
    private Double actualHours;
    private String tags;
    private String aiSuggestion;
    private Boolean aiAnalyzed;
    private Long userId;

    private Long createdByUserId;
    private String createdByUserName;
    private Long createdByDepartmentId;
    private String createdByDepartmentName;

    private Long assignedToDepartmentId;
    private String assignedToDepartmentName;
    private Long assignedToUserId;
    private String assignedToUserName;

    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed / presentation-only fields
    private Boolean isOverdue;
    private Long daysUntilDue;
    private Boolean canApprove;
    private Boolean canSubmit;
}
