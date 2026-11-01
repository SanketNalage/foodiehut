package com.foodiehut.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications", indexes = {
    @Index(name = "idx_otp_contact", columnList = "contact")
})
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String contact; // email or phone

    @Column(nullable = false, length = 120)
    private String otpHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role targetRole;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(nullable = false)
    private LocalDateTime lastSentAt = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public OtpVerification() {}

    public OtpVerification(String contact, String otpHash, Role targetRole, LocalDateTime expiresAt) {
        this.contact = contact;
        this.otpHash = otpHash;
        this.targetRole = targetRole;
        this.expiresAt = expiresAt;
        this.attempts = 0;
        this.verified = false;
        this.lastSentAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public Role getTargetRole() { return targetRole; }
    public void setTargetRole(Role targetRole) { this.targetRole = targetRole; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public LocalDateTime getLastSentAt() { return lastSentAt; }
    public void setLastSentAt(LocalDateTime lastSentAt) { this.lastSentAt = lastSentAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

