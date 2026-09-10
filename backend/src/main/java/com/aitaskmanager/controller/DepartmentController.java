package com.aitaskmanager.controller;

import com.aitaskmanager.service.DepartmentService;
import com.aitaskmanager.view.dto.request.DepartmentRequest;
import com.aitaskmanager.view.dto.response.ApiResponse;
import com.aitaskmanager.view.dto.response.DepartmentResponse;
import com.aitaskmanager.view.dto.response.UserProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    /** GET /api/departments — List active departments */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getDepartments() {
        List<DepartmentResponse> departments = departmentService.getAllActiveDepartments();
        return ResponseEntity.ok(ApiResponse.success("Departments fetched", departments));
    }

    /** GET /api/departments/allowed-targets — Departments current user is permitted to assign tasks to */
    @GetMapping("/allowed-targets")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllowedTargetDepartments(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<DepartmentResponse> targets = departmentService.getAllowedTargetDepartments(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Allowed target departments fetched", targets));
    }

    /** GET /api/departments/{id}/users — Users belonging to department */
    @GetMapping("/{id}/users")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getUsersByDepartment(@PathVariable Long id) {
        List<UserProfileResponse> users = departmentService.getUsersByDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department users fetched", users));
    }

    /** POST /api/departments — Create department (ADMIN / SUPER_ADMIN) */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse department = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully", department));
    }

    /** PUT /api/departments/{id} — Update department (ADMIN / SUPER_ADMIN) */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse department = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", department));
    }
}
