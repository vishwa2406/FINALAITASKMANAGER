package com.aitaskmanager.view.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskReviewRequest {

    private String comment;
}
