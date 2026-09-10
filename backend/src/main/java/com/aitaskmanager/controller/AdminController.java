package com.aitaskmanager.controller;

import com.aitaskmanager.model.enums.Role;
import com.aitaskmanager.service.ActivityLogService;
import com.aitaskmanager.service.AdminService;
import com.aitaskmanager.view.dto.request.ActivityFilterRequest;
import com.aitaskmanager.view.dto.request.UserRoleUpdateRequest;
import com.aitaskmanager.view.dto.response.ActivityLogResponse;
import com.aitaskmanager.view.dto.response.AdminOverviewStatsResponse;
import com.aitaskmanager.view.dto.response.ApiResponse;
import com.aitaskmanager.view.dto.response.UserAdminResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * ============================================================
 * CONTROLLER — Admin Panel Controller
 * ============================================================
 * Provides REST API endpoints for system activity tracking,
 * overall admin metrics, and user account/role management.
 * Strictly protected for ADMIN & SUPER_ADMIN roles.
 * ============================================================
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminController {

    private final ActivityLogService activityLogService;
    private final AdminService adminService;

    /**
     * GET /api/admin/activities — Paginated system activity audit log
     */
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<Page<ActivityLogResponse>>> getActivities(
            @Valid ActivityFilterRequest filter) {
        Page<ActivityLogResponse> result = activityLogService.getActivities(filter);
        return ResponseEntity.ok(ApiResponse.success("Activity logs retrieved successfully", result));
    }

    /**
     * GET /api/admin/stats/overview — System-wide analytics & breakdown
     */
    @GetMapping("/stats/overview")
    public ResponseEntity<ApiResponse<AdminOverviewStatsResponse>> getOverviewStats() {
        AdminOverviewStatsResponse stats = adminService.getOverviewStats();
        return ResponseEntity.ok(ApiResponse.success("Admin overview stats retrieved successfully", stats));
    }

    /**
     * GET /api/admin/users — User directory list for admin management
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserAdminResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Page<UserAdminResponse> users = adminService.getUsersList(page, size, search);
        return ResponseEntity.ok(ApiResponse.success("User directory retrieved successfully", users));
    }

    /**
     * PATCH /api/admin/users/{id}/role — Update role of target user
     */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserAdminResponse>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequest request,
            @AuthenticationPrincipal UserDetails adminUser) {
        UserAdminResponse updated = adminService.updateUserRole(id, request.getRole(), adminUser.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updated));
    }

    /**
     * PATCH /api/admin/users/{id}/status — Enable or disable target user account
     */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserAdminResponse>> toggleUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails adminUser) {
        UserAdminResponse updated = adminService.toggleUserStatus(id, adminUser.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User account status toggled successfully", updated));
    }
}
