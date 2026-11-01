package com.foodiehut.controller;

import com.foodiehut.dto.*;
import com.foodiehut.security.UserPrincipal;
import com.foodiehut.service.CanteenService;
import com.foodiehut.service.FoodService;
import com.foodiehut.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/canteens")
@Tag(name = "Canteens", description = "Canteen discovery, owner dashboard, order management and analytics APIs")
public class CanteenController {

    private final CanteenService canteenService;
    private final FoodService foodService;
    private final OrderService orderService;

    public CanteenController(CanteenService canteenService, FoodService foodService, OrderService orderService) {
        this.canteenService = canteenService;
        this.foodService = foodService;
        this.orderService = orderService;
    }

    @GetMapping
    @Operation(summary = "List all active canteens")
    public ResponseEntity<ApiResponse<List<CanteenDto>>> getActiveCanteens() {
        return ResponseEntity.ok(ApiResponse.ok(canteenService.getAllActiveCanteens()));
    }

    @GetMapping("/{canteenCode}")
    @Operation(summary = "Get canteen details by unique Canteen Code")
    public ResponseEntity<ApiResponse<CanteenDto>> getByCanteenCode(@PathVariable String canteenCode) {
        return ResponseEntity.ok(ApiResponse.ok(canteenService.getByCode(canteenCode)));
    }

    @GetMapping("/{canteenCode}/menu")
    @Operation(summary = "Get food menu for canteen by Canteen Code")
    public ResponseEntity<ApiResponse<List<FoodItemDto>>> getCanteenMenu(@PathVariable String canteenCode) {
        return ResponseEntity.ok(ApiResponse.ok(foodService.getMenuByCanteenCode(canteenCode)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Get authenticated canteen owner's profile and QR")
    public ResponseEntity<ApiResponse<CanteenDto>> getMyCanteen(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(canteenService.getProfileByUserId(principal.getId())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Update authenticated canteen profile")
    public ResponseEntity<ApiResponse<CanteenDto>> updateMyCanteen(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @RequestBody CanteenRegisterRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Canteen updated successfully.", canteenService.updateProfile(principal.getId(), req)));
    }

    @GetMapping("/me/analytics")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Get live sales and order statistics for canteen dashboard")
    public ResponseEntity<ApiResponse<CanteenAnalyticsDto>> getAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(canteenService.getAnalytics(principal.getId())));
    }

    @GetMapping("/me/orders")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Get all incoming and past orders for this canteen")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getCanteenOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getCanteenOrders(principal.getId())));
    }

    @PatchMapping("/me/orders/{orderId}/status")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Update order status (ACCEPT, PREPARE, READY, COMPLETE, CANCEL)")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable Long orderId,
                                                                   @Valid @RequestBody OrderStatusUpdateRequest req) {
        OrderDto updated = orderService.updateOrderStatus(principal.getId(), orderId, req);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated to " + updated.getStatus(), updated));
    }
}
