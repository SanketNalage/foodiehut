package com.foodiehut.service;

import com.foodiehut.entity.OtpVerification;
import com.foodiehut.entity.Role;
import com.foodiehut.exception.BadRequestException;
import com.foodiehut.repository.OtpVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private final OtpVerificationRepository otpRepository;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.provider:mock}")
    private String otpProvider;

    @Value("${app.otp.default-mock-otp:123456}")
    private String defaultMockOtp;

    @Value("${app.otp.expiry-seconds:300}")
    private long expirySeconds;

    @Value("${app.otp.resend-cooldown-seconds:30}")
    private long resendCooldownSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    public OtpService(OtpVerificationRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    @Transactional
    public String requestOtp(String rawContact, Role role) {
        String contact = rawContact.trim().toLowerCase();

        Optional<OtpVerification> existingOpt = otpRepository.findTopByContactOrderByCreatedAtDesc(contact);
        if (existingOpt.isPresent()) {
            OtpVerification existing = existingOpt.get();
            long secondsSinceLastSent = Duration.between(existing.getLastSentAt(), LocalDateTime.now()).getSeconds();
            if (secondsSinceLastSent < resendCooldownSeconds) {
                throw new BadRequestException("Please wait " + (resendCooldownSeconds - secondsSinceLastSent) + " seconds before requesting a new OTP.");
            }
        }

        // Generate 6 digit numeric code
        String plainOtp = "mock".equalsIgnoreCase(otpProvider) ? defaultMockOtp : String.format("%06d", random.nextInt(1_000_000));
        String salt = BCrypt.gensalt(10);
        String hashedOtp = BCrypt.hashpw(plainOtp, salt);

        // Remove old entries for contact
        otpRepository.deleteByContact(contact);

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expirySeconds);
        OtpVerification verification = new OtpVerification(contact, hashedOtp, role, expiresAt);
        otpRepository.save(verification);

        // Delivery abstraction
        deliverOtp(contact, plainOtp);

        return "mock".equalsIgnoreCase(otpProvider) ? plainOtp : null;
    }

    @Transactional
    public boolean verifyOtp(String rawContact, String submittedOtp, Role expectedRole) {
        String contact = rawContact.trim().toLowerCase();

        OtpVerification verification = otpRepository.findTopByContactOrderByCreatedAtDesc(contact)
                .orElseThrow(() -> new BadRequestException("No active OTP found for " + contact + ". Please request a new OTP."));

        if (verification.isVerified()) {
            throw new BadRequestException("OTP has already been used. Please request a new OTP.");
        }

        if (LocalDateTime.now().isAfter(verification.getExpiresAt())) {
            otpRepository.delete(verification);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (verification.getAttempts() >= maxAttempts) {
            otpRepository.delete(verification);
            throw new BadRequestException("Maximum OTP verification attempts exceeded. Please request a new OTP.");
        }

        verification.setAttempts(verification.getAttempts() + 1);

        boolean matches = BCrypt.checkpw(submittedOtp, verification.getOtpHash())
                || ("mock".equalsIgnoreCase(otpProvider) && defaultMockOtp.equals(submittedOtp));

        if (!matches) {
            otpRepository.save(verification);
            throw new BadRequestException("Invalid OTP. Attempts remaining: " + (maxAttempts - verification.getAttempts()));
        }

        if (verification.getTargetRole() != expectedRole) {
            throw new BadRequestException("OTP was issued for role " + verification.getTargetRole() + ", not " + expectedRole);
        }

        verification.setVerified(true);
        otpRepository.save(verification);
        return true;
    }

    private void deliverOtp(String contact, String plainOtp) {
        if ("mock".equalsIgnoreCase(otpProvider)) {
            log.info("=================================================");
            log.info("[MOCK OTP NOTIFICATION] Contact: {} | Code: {}", contact, plainOtp);
            log.info("=================================================");
        } else {
            // Real Email / SMS provider integration hook
            log.info("Sending real OTP to {}: [REDACTED]", contact);
        }
    }
}

