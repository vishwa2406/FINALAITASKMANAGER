package com.aitaskmanager.view.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentAssignmentRuleResponse {
    private Long id;
    private Long sourceDepartmentId;
    private String sourceDepartmentName;
    private String sourceDepartmentCode;
    private Long targetDepartmentId;
    private String targetDepartmentName;
    private String targetDepartmentCode;
    private Boolean active;
    private LocalDateTime createdAt;
}
