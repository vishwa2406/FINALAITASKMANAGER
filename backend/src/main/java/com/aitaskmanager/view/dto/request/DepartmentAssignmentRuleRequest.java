package com.aitaskmanager.view.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentAssignmentRuleRequest {

    @NotNull(message = "Source department ID is required")
    private Long sourceDepartmentId;

    @NotNull(message = "Target department ID is required")
    private Long targetDepartmentId;

    @Builder.Default
    private Boolean active = true;
}
