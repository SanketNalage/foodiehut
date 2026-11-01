package com.foodiehut.dto;

import com.foodiehut.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OtpRequestDto {

    @NotBlank(message = "Contact (email or phone) is required")
    private String contact;

    @NotNull(message = "Role is required")
    private Role role;

    public OtpRequestDto() {}

    public OtpRequestDto(String contact, Role role) {
        this.contact = contact;
        this.role = role;
    }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}

