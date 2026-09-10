package com.aitaskmanager.view.dto.response;

import com.aitaskmanager.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private Boolean active;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private long totalTasksCreated;
    private long totalTasksAssigned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
