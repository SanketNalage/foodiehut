package com.foodiehut.controller;

import com.foodiehut.dto.ApiResponse;
import com.foodiehut.dto.OrderCreateRequest;
import com.foodiehut.dto.OrderDto;
import com.foodiehut.security.UserPrincipal;
import com.foodiehut.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order placement and order details APIs")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @Operation(summary = "Place a food order (Backend calculates prices from database)")
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(@AuthenticationPrincipal UserPrincipal principal,
                                                            @Valid @RequestBody OrderCreateRequest req) {
        OrderDto order = orderService.placeOrder(principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully.", order));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get order details (enforces student / canteen ownership check)")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@AuthenticationPrincipal UserPrincipal principal,
                                                              @PathVariable Long orderId) {
        OrderDto order = orderService.getOrderById(principal.getId(), principal.getRole(), orderId);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }
}

