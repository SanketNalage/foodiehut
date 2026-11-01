package com.foodiehut.dto;

import com.foodiehut.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class OtpVerifyDto {

    @NotBlank(message = "Contact (email or phone) is required")
    private String contact;

    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be exactly 6 digits")
    private String otp;

    @NotNull(message = "Role is required")
    private Role role;

    public OtpVerifyDto() {}

    public OtpVerifyDto(String contact, String otp, Role role) {
        this.contact = contact;
        this.otp = otp;
        this.role = role;
    }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}

