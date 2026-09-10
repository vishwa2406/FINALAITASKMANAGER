package com.aitaskmanager.view.dto.request;

import com.aitaskmanager.model.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRoleUpdateRequest {
    @NotNull(message = "Role is required")
    private Role role;
}
