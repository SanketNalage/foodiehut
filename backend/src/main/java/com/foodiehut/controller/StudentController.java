package com.foodiehut.controller;

import com.foodiehut.dto.ApiResponse;
import com.foodiehut.dto.OrderDto;
import com.foodiehut.dto.StudentDto;
import com.foodiehut.dto.StudentRegisterRequest;
import com.foodiehut.security.UserPrincipal;
import com.foodiehut.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Students", description = "Student profile and order history APIs")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @Operation(summary = "Get current student profile and QR code")
    public ResponseEntity<ApiResponse<StudentDto>> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        StudentDto profile = studentService.getProfileByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @Operation(summary = "Update student profile")
    public ResponseEntity<ApiResponse<StudentDto>> updateMyProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @RequestBody StudentRegisterRequest req) {
        StudentDto profile = studentService.updateProfile(principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully.", profile));
    }

    @GetMapping("/me/orders")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @Operation(summary = "Get current student order history")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDto> orders = studentService.getMyOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/me/orders/{orderId}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @Operation(summary = "Get student order details")
    public ResponseEntity<ApiResponse<OrderDto>> getMyOrder(@AuthenticationPrincipal UserPrincipal principal,
                                                            @PathVariable Long orderId) {
        OrderDto order = studentService.getMyOrder(principal.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }
}
