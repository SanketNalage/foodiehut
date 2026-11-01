package com.foodiehut.websocket;

import com.foodiehut.dto.OrderDto;
import com.foodiehut.entity.OrderStatus;

public class OrderEvent {
    private String eventType; // ORDER_CREATED, ORDER_STATUS_UPDATED
    private String orderNumber;
    private OrderStatus status;
    private OrderDto order;

    public OrderEvent() {}

    public OrderEvent(String eventType, String orderNumber, OrderStatus status, OrderDto order) {
        this.eventType = eventType;
        this.orderNumber = orderNumber;
        this.status = status;
        this.order = order;
    }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public OrderDto getOrder() { return order; }
    public void setOrder(OrderDto order) { this.order = order; }
}
