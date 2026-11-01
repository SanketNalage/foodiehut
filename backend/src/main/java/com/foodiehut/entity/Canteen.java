package com.foodiehut.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "canteens", indexes = {
    @Index(name = "idx_canteen_code", columnList = "canteenCode", unique = true)
})
public class Canteen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private User owner;

    @Column(nullable = false, length = 120)
    private String canteenName;

    @Column(nullable = false, unique = true, length = 32)
    private String canteenCode;

    @Column(length = 500)
    private String description;

    @Column(length = 250)
    private String address;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String qrCodeData;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Canteen() {}

    public Canteen(User owner, String canteenName, String canteenCode, String description, String address) {
        this.owner = owner;
        this.canteenName = canteenName;
        this.canteenCode = canteenCode;
        this.description = description;
        this.address = address;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public String getCanteenName() { return canteenName; }
    public void setCanteenName(String canteenName) { this.canteenName = canteenName; }
    public String getCanteenCode() { return canteenCode; }
    public void setCanteenCode(String canteenCode) { this.canteenCode = canteenCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

