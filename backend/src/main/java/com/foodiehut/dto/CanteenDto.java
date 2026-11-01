package com.foodiehut.dto;

import com.foodiehut.entity.Canteen;

public class CanteenDto {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String email;
    private String phone;
    private String canteenName;
    private String canteenCode;
    private String description;
    private String address;
    private String qrCodeData;
    private boolean active;
    private String mockOtp;

    public CanteenDto() {}

    public static CanteenDto fromEntity(Canteen c) {
        CanteenDto dto = new CanteenDto();
        dto.setId(c.getId());
        dto.setOwnerId(c.getOwner().getId());
        dto.setOwnerName(c.getOwner().getFullName());
        dto.setEmail(c.getOwner().getEmail());
        dto.setPhone(c.getOwner().getPhone());
        dto.setCanteenName(c.getCanteenName());
        dto.setCanteenCode(c.getCanteenCode());
        dto.setDescription(c.getDescription());
        dto.setAddress(c.getAddress());
        dto.setQrCodeData(c.getQrCodeData());
        dto.setActive(c.isActive());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
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
    public String getMockOtp() { return mockOtp; }
    public void setMockOtp(String mockOtp) { this.mockOtp = mockOtp; }
}

