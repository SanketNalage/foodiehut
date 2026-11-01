package com.foodiehut.entity;

public enum OrderStatus {
    PLACED,
    ACCEPTED,
    PREPARING,
    READY,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus newStatus) {
        if (this == newStatus) {
            return true;
        }
        return switch (this) {
            case PLACED -> (newStatus == ACCEPTED || newStatus == CANCELLED);
            case ACCEPTED -> (newStatus == PREPARING || newStatus == CANCELLED);
            case PREPARING -> (newStatus == READY || newStatus == CANCELLED);
            case READY -> (newStatus == COMPLETED);
            case COMPLETED, CANCELLED -> false;
        };
    }
}

