package com.aitaskmanager.view.dto.response;

import com.aitaskmanager.model.enums.TaskStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskHistoryResponse {
    private Long id;
    private Long taskId;
    private Long performedByUserId;
    private String performedByUserName;
    private String performedByUserEmail;
    private String action;
    private TaskStatus oldStatus;
    private TaskStatus newStatus;
    private String comment;
    private LocalDateTime createdAt;
}
