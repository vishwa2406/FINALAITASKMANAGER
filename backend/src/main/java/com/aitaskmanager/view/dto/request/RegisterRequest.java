package com.aitaskmanager.view.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * ============================================================
 * VIEW LAYER — Request DTO
 * ============================================================
 * "View" in a REST API = the JSON shape exchanged with the
 * client. Request DTOs define what the client is ALLOWED to
 * send us, with validation rules attached.
 *
 * This is intentionally separate from model.entity.User so
 * the client can never set fields like `id`, `role`, or
 * `createdAt` directly — only what we expose here.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Password must contain uppercase, lowercase, and a number"
    )
    private String password;

    private Long departmentId;

    private String role;
}
