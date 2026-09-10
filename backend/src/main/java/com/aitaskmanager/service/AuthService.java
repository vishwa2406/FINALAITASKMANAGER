package com.aitaskmanager.service;

import com.aitaskmanager.exception.ResourceAlreadyExistsException;
import com.aitaskmanager.exception.ResourceNotFoundException;
import com.aitaskmanager.model.entity.Department;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.model.enums.ActivityCategory;
import com.aitaskmanager.model.enums.Role;
import com.aitaskmanager.model.enums.TaskStatus;
import com.aitaskmanager.repository.DepartmentRepository;
import com.aitaskmanager.repository.TaskRepository;
import com.aitaskmanager.repository.UserRepository;
import com.aitaskmanager.security.JwtService;
import com.aitaskmanager.view.dto.request.LoginRequest;
import com.aitaskmanager.view.dto.request.RegisterRequest;
import com.aitaskmanager.view.dto.response.AuthResponse;
import com.aitaskmanager.view.dto.response.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ============================================================
 * SERVICE — Auth Business Logic with Department & Role Support
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final ActivityLogService activityLogService;

    /**
     * Register user with Department & Role assignment
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                "Email already registered: " + request.getEmail());
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        } else {
            // Default to IT department if unassigned
            department = departmentRepository.findByCode("IT").orElse(null);
        }

        Role userRole = Role.USER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                userRole = Role.USER;
            }
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .department(department)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        log.info("User saved with id={}, dept={}", saved.getId(), department != null ? department.getCode() : "NONE");

        activityLogService.logActivity(saved, ActivityCategory.AUTH, "USER_REGISTER", "USER", saved.getId(), "New user account registered: " + saved.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .userId(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .departmentId(saved.getDepartment() != null ? saved.getDepartment().getId() : null)
                .departmentName(saved.getDepartment() != null ? saved.getDepartment().getName() : null)
                .departmentCode(saved.getDepartment() != null ? saved.getDepartment().getCode() : null)
                .message("Registration successful")
                .build();
    }

    /**
     * Login → authenticate via Spring Security → load User entity → return AuthResponse
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt: {}", request.getEmail());

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword()));
        } catch (AuthenticationException e) {
            log.warn("Failed login for: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        log.info("User logged in: {}", user.getEmail());
        activityLogService.logActivity(user, ActivityCategory.AUTH, "USER_LOGIN", "USER", user.getId(), "User logged in successfully");

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .departmentCode(user.getDepartment() != null ? user.getDepartment().getCode() : null)
                .message("Login successful")
                .build();
    }

    /**
     * User profile with cross-department statistics
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long uid = user.getId();
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;

        long total = taskRepository.countByUserId(uid);
        long completed = taskRepository.countByUserIdAndStatus(uid, TaskStatus.COMPLETED);
        long incoming = taskRepository.countIncomingTasks(uid, deptId != null ? deptId : -1L);
        long outgoing = taskRepository.countOutgoingTasks(uid);
        long waitingReview = taskRepository.countWaitingReviewTasks(uid, deptId != null ? deptId : -1L);

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .departmentCode(user.getDepartment() != null ? user.getDepartment().getCode() : null)
                .createdAt(user.getCreatedAt())
                .totalTasks(total)
                .completedTasks(completed)
                .pendingTasks(total - completed)
                .incomingTasks(incoming)
                .outgoingTasks(outgoing)
                .waitingReviewTasks(waitingReview)
                .build();
    }
}
