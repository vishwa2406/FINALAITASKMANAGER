package com.aitaskmanager.view.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCommentResponse {
    private Long id;
    private Long taskId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
