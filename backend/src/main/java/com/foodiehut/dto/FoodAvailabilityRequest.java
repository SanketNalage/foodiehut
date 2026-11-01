package com.foodiehut.dto;

import jakarta.validation.constraints.NotNull;

public class FoodAvailabilityRequest {

    @NotNull(message = "available status is required")
    private Boolean available;

    public FoodAvailabilityRequest() {}

    public FoodAvailabilityRequest(Boolean available) {
        this.available = available;
    }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}
