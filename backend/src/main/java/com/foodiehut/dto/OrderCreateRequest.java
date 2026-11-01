package com.foodiehut.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class OrderCreateRequest {

    @NotBlank(message = "Canteen code is required")
    private String canteenCode;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<OrderItemRequest> items;

    public OrderCreateRequest() {}

    public OrderCreateRequest(String canteenCode, List<OrderItemRequest> items) {
        this.canteenCode = canteenCode;
        this.items = items;
    }

    public String getCanteenCode() { return canteenCode; }
    public void setCanteenCode(String canteenCode) { this.canteenCode = canteenCode; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}

