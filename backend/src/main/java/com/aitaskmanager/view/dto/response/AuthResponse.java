package com.aitaskmanager.view.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * View layer DTO returned after successful register/login.
 * Notice: NO password field — the Model's password hash never
 * reaches this View object.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private String tokenType;   // "Bearer"
    private Long expiresIn;     // milliseconds
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String message;
}
