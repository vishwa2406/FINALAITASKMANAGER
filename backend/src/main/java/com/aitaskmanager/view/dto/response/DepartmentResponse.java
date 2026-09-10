package com.aitaskmanager.view.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
}
