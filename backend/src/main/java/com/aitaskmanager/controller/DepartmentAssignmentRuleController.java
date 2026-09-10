package com.aitaskmanager.controller;

import com.aitaskmanager.service.DepartmentService;
import com.aitaskmanager.view.dto.request.DepartmentAssignmentRuleRequest;
import com.aitaskmanager.view.dto.response.ApiResponse;
import com.aitaskmanager.view.dto.response.DepartmentAssignmentRuleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignment-rules")
@RequiredArgsConstructor
public class DepartmentAssignmentRuleController {

    private final DepartmentService departmentService;

    /** GET /api/assignment-rules — List all assignment rules */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentAssignmentRuleResponse>>> getAssignmentRules() {
        List<DepartmentAssignmentRuleResponse> rules = departmentService.getAllAssignmentRules();
        return ResponseEntity.ok(ApiResponse.success("Assignment rules fetched", rules));
    }

    /** POST /api/assignment-rules — Create assignment rule (ADMIN / SUPER_ADMIN) */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentAssignmentRuleResponse>> createRule(
            @Valid @RequestBody DepartmentAssignmentRuleRequest request) {
        DepartmentAssignmentRuleResponse rule = departmentService.createAssignmentRule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assignment rule created successfully", rule));
    }

    /** DELETE /api/assignment-rules/{id} — Deactivate assignment rule (ADMIN / SUPER_ADMIN) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        departmentService.deleteAssignmentRule(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment rule deactivated successfully"));
    }
}
