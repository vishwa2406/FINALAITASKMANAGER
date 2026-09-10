package com.aitaskmanager.view.dto.request;

import com.aitaskmanager.model.enums.TaskPriority;
import com.aitaskmanager.model.enums.TaskStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * ============================================================
 * VIEW LAYER — Request DTO
 * ============================================================
 * Used for both POST /api/tasks (create) and PUT /api/tasks/{id}
 * (update). Validation annotations enforce the contract clients
 * must follow — this is the View layer's "input contract".
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
    private String title;

    @Size(max = 5000, message = "Description too long")
    private String description;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    @Size(max = 100, message = "Category too long")
    private String category;

    @FutureOrPresent(message = "Due date must not be in the past")
    private LocalDate dueDate;

    @Positive(message = "Estimated hours must be positive")
    @Max(value = 1000, message = "Estimated hours too high")
    private Double estimatedHours;

    @Positive(message = "Actual hours must be positive")
    private Double actualHours;

    @Size(max = 500, message = "Tags too long")
    private String tags;

    private Long assignedToDepartmentId;

    private Long assignedToUserId;
}
