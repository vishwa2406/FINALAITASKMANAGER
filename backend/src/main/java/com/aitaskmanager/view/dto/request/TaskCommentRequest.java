package com.aitaskmanager.view.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCommentRequest {

    @NotBlank(message = "Comment content cannot be blank")
    private String comment;
}
