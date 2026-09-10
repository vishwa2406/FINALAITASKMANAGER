package com.aitaskmanager.view.dto.request;

import com.aitaskmanager.model.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * View layer DTO for PATCH /api/tasks/{id}/status
 * A small, focused request object instead of reusing the
 * full TaskRequest (which would require all fields).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;
}
