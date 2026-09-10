package com.aitaskmanager.controller;

import com.aitaskmanager.service.AuthService;
import com.aitaskmanager.view.dto.request.LoginRequest;
import com.aitaskmanager.view.dto.request.RegisterRequest;
import com.aitaskmanager.view.dto.response.ApiResponse;
import com.aitaskmanager.view.dto.response.AuthResponse;
import com.aitaskmanager.view.dto.response.UserProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * ============================================================
 * CONTROLLER — Auth Endpoints
 * ============================================================
 * In Spring MVC the Controller is the "C":
 *  • @RestController maps HTTP requests to methods
 *  • Methods receive View DTOs (request) via @RequestBody
 *  • Methods delegate ALL logic to the Service layer
 *  • Methods wrap the Service result in ApiResponse (View)
 *    and return it as ResponseEntity
 *
 * Controllers must stay thin — no business logic here.
 *
 * Endpoints:
 *   POST /api/auth/register  → register new user
 *   POST /api/auth/login     → login, returns JWT
 *   GET  /api/auth/me        → current user profile
 * ============================================================
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        log.info("Register endpoint hit: {}", request.getEmail());
        AuthResponse data = authService.register(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("User registered successfully", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        log.info("Login endpoint hit: {}", request.getEmail());
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", data));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserProfileResponse profile = authService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }
}
