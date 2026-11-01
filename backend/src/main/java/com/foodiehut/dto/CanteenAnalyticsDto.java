package com.foodiehut.dto;

import java.math.BigDecimal;

public class CanteenAnalyticsDto {
    private long totalOrdersToday;
    private long pendingOrders;
    private long preparingOrders;
    private long readyOrders;
    private long completedOrdersToday;
    private BigDecimal todayRevenue;

    public CanteenAnalyticsDto() {
        this.todayRevenue = BigDecimal.ZERO;
    }

    public long getTotalOrdersToday() { return totalOrdersToday; }
    public void setTotalOrdersToday(long totalOrdersToday) { this.totalOrdersToday = totalOrdersToday; }
    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
    public long getPreparingOrders() { return preparingOrders; }
    public void setPreparingOrders(long preparingOrders) { this.preparingOrders = preparingOrders; }
    public long getReadyOrders() { return readyOrders; }
    public void setReadyOrders(long readyOrders) { this.readyOrders = readyOrders; }
    public long getCompletedOrdersToday() { return completedOrdersToday; }
    public void setCompletedOrdersToday(long completedOrdersToday) { this.completedOrdersToday = completedOrdersToday; }
    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }
}

