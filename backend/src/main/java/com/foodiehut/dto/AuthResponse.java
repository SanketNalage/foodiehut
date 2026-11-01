package com.foodiehut.dto;

import com.foodiehut.entity.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Object profile; // StudentDto or CanteenDto

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String fullName, String email, String phone, Role role, Object profile) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.profile = profile;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Object getProfile() { return profile; }
    public void setProfile(Object profile) { this.profile = profile; }
}

