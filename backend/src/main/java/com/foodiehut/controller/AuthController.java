package com.foodiehut.controller;

import com.foodiehut.dto.*;
import com.foodiehut.entity.Role;
import com.foodiehut.security.UserPrincipal;
import com.foodiehut.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Student and Canteen OTP-based authentication APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/student/register")
    @Operation(summary = "Register a new Student")
    public ResponseEntity<ApiResponse<StudentDto>> registerStudent(@Valid @RequestBody StudentRegisterRequest req) {
        StudentDto student = authService.registerStudent(req);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Verification OTP sent.", student));
    }

    @PostMapping("/student/request-otp")
    @Operation(summary = "Request OTP for Student login")
    public ResponseEntity<ApiResponse<String>> requestStudentOtp(@Valid @RequestBody OtpRequestDto req) {
        req.setRole(Role.ROLE_STUDENT);
        String mockOtp = authService.requestOtp(req);
        String msg = mockOtp != null ? "OTP sent. (Dev mode mock OTP: " + mockOtp + ")" : "OTP sent successfully.";
        return ResponseEntity.ok(ApiResponse.ok(msg, mockOtp));
    }

    @PostMapping("/student/verify-otp")
    @Operation(summary = "Verify Student OTP and receive JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyStudentOtp(@Valid @RequestBody OtpVerifyDto req) {
        req.setRole(Role.ROLE_STUDENT);
        AuthResponse response = authService.verifyOtp(req);
        return ResponseEntity.ok(ApiResponse.ok("Authenticated successfully.", response));
    }

    @PostMapping("/canteen/register")
    @Operation(summary = "Register a new Canteen and Owner")
    public ResponseEntity<ApiResponse<CanteenDto>> registerCanteen(@Valid @RequestBody CanteenRegisterRequest req) {
        CanteenDto canteen = authService.registerCanteen(req);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Verification OTP sent.", canteen));
    }

    @PostMapping("/canteen/request-otp")
    @Operation(summary = "Request OTP for Canteen Owner login")
    public ResponseEntity<ApiResponse<String>> requestCanteenOtp(@Valid @RequestBody OtpRequestDto req) {
        req.setRole(Role.ROLE_CANTEEN_OWNER);
        String mockOtp = authService.requestOtp(req);
        String msg = mockOtp != null ? "OTP sent. (Dev mode mock OTP: " + mockOtp + ")" : "OTP sent successfully.";
        return ResponseEntity.ok(ApiResponse.ok(msg, mockOtp));
    }

    @PostMapping("/canteen/verify-otp")
    @Operation(summary = "Verify Canteen Owner OTP and receive JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyCanteenOtp(@Valid @RequestBody OtpVerifyDto req) {
        req.setRole(Role.ROLE_CANTEEN_OWNER);
        AuthResponse response = authService.verifyOtp(req);
        return ResponseEntity.ok(ApiResponse.ok("Authenticated successfully.", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user session details")
    public ResponseEntity<ApiResponse<UserPrincipal>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated"));
        }
        return ResponseEntity.ok(ApiResponse.ok(principal));
    }
}
