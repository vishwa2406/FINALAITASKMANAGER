package com.aitaskmanager.service;

import com.aitaskmanager.exception.ResourceAlreadyExistsException;
import com.aitaskmanager.exception.ResourceNotFoundException;
import com.aitaskmanager.model.entity.Department;
import com.aitaskmanager.model.entity.DepartmentAssignmentRule;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.repository.DepartmentAssignmentRuleRepository;
import com.aitaskmanager.repository.DepartmentRepository;
import com.aitaskmanager.repository.UserRepository;
import com.aitaskmanager.view.dto.request.DepartmentAssignmentRuleRequest;
import com.aitaskmanager.view.dto.request.DepartmentRequest;
import com.aitaskmanager.view.dto.response.DepartmentAssignmentRuleResponse;
import com.aitaskmanager.view.dto.response.DepartmentResponse;
import com.aitaskmanager.view.dto.response.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentAssignmentRuleRepository ruleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllActiveDepartments() {
        return departmentRepository.findByActiveTrue().stream()
                .map(this::mapToDepartmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = findDepartmentById(id);
        return mapToDepartmentResponse(department);
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new ResourceAlreadyExistsException("Department code already exists: " + request.getCode());
        }

        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Department saved = departmentRepository.save(department);
        log.info("Created department code={}", saved.getCode());
        return mapToDepartmentResponse(saved);
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = findDepartmentById(id);
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        if (request.getActive() != null) {
            department.setActive(request.getActive());
        }
        Department updated = departmentRepository.save(department);
        return mapToDepartmentResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getUsersByDepartment(Long departmentId) {
        Department department = findDepartmentById(departmentId);
        return userRepository.findByDepartmentIdAndActiveTrue(department.getId()).stream()
                .map(user -> UserProfileResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .departmentId(department.getId())
                        .departmentName(department.getName())
                        .departmentCode(department.getCode())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllowedTargetDepartments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // ADMIN or SUPER_ADMIN can assign to any department
        if (user.getRole().name().equals("ADMIN") || user.getRole().name().equals("SUPER_ADMIN") || user.getDepartment() == null) {
            return getAllActiveDepartments();
        }

        Long sourceDeptId = user.getDepartment().getId();
        List<DepartmentAssignmentRule> rules = ruleRepository.findBySourceDepartmentIdAndActiveTrue(sourceDeptId);

        List<DepartmentResponse> allowedTargets = rules.stream()
                .map(rule -> mapToDepartmentResponse(rule.getTargetDepartment()))
                .filter(DepartmentResponse::getActive)
                .collect(Collectors.toList());

        // Always allow self department assignment as well
        if (allowedTargets.stream().noneMatch(d -> d.getId().equals(sourceDeptId))) {
            allowedTargets.add(0, mapToDepartmentResponse(user.getDepartment()));
        }

        return allowedTargets;
    }

    @Transactional(readOnly = true)
    public List<DepartmentAssignmentRuleResponse> getAllAssignmentRules() {
        return ruleRepository.findAllActiveRules().stream()
                .map(this::mapToRuleResponse)
                .collect(Collectors.toList());
    }

    public DepartmentAssignmentRuleResponse createAssignmentRule(DepartmentAssignmentRuleRequest request) {
        Department source = findDepartmentById(request.getSourceDepartmentId());
        Department target = findDepartmentById(request.getTargetDepartmentId());

        if (ruleRepository.existsBySourceDepartmentIdAndTargetDepartmentIdAndActiveTrue(source.getId(), target.getId())) {
            throw new ResourceAlreadyExistsException("Assignment rule already exists between " + source.getCode() + " and " + target.getCode());
        }

        DepartmentAssignmentRule rule = ruleRepository.findBySourceDepartmentIdAndTargetDepartmentId(source.getId(), target.getId())
                .orElse(DepartmentAssignmentRule.builder()
                        .sourceDepartment(source)
                        .targetDepartment(target)
                        .build());

        rule.setActive(request.getActive() != null ? request.getActive() : true);
        DepartmentAssignmentRule saved = ruleRepository.save(rule);
        log.info("Assignment rule created/updated: {} -> {}", source.getCode(), target.getCode());
        return mapToRuleResponse(saved);
    }

    public void deleteAssignmentRule(Long ruleId) {
        DepartmentAssignmentRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));
        rule.setActive(false);
        ruleRepository.save(rule);
        log.info("Deactivated assignment rule id={}", ruleId);
    }

    private Department findDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private DepartmentResponse mapToDepartmentResponse(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .code(d.getCode())
                .description(d.getDescription())
                .active(d.getActive())
                .createdAt(d.getCreatedAt())
                .build();
    }

    private DepartmentAssignmentRuleResponse mapToRuleResponse(DepartmentAssignmentRule r) {
        return DepartmentAssignmentRuleResponse.builder()
                .id(r.getId())
                .sourceDepartmentId(r.getSourceDepartment().getId())
                .sourceDepartmentName(r.getSourceDepartment().getName())
                .sourceDepartmentCode(r.getSourceDepartment().getCode())
                .targetDepartmentId(r.getTargetDepartment().getId())
                .targetDepartmentName(r.getTargetDepartment().getName())
                .targetDepartmentCode(r.getTargetDepartment().getCode())
                .active(r.getActive())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
