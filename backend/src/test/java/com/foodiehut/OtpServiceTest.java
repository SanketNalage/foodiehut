package com.foodiehut;

import com.foodiehut.entity.OtpVerification;
import com.foodiehut.entity.Role;
import com.foodiehut.exception.BadRequestException;
import com.foodiehut.repository.OtpVerificationRepository;
import com.foodiehut.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class OtpServiceTest {

    @Autowired
    private OtpService otpService;

    @Autowired
    private OtpVerificationRepository otpRepository;

    @BeforeEach
    void setUp() {
        otpRepository.deleteAll();
    }

    @Test
    @DisplayName("Test 5: Invalid OTP is rejected")
    void testInvalidOtpRejected() {
        String contact = "student1@example.com";
        otpService.requestOtp(contact, Role.ROLE_STUDENT);

        assertThrows(BadRequestException.class, () -> {
            otpService.verifyOtp(contact, "000000", Role.ROLE_STUDENT);
        });
    }

    @Test
    @DisplayName("Test 6: Expired OTP is rejected")
    void testExpiredOtpRejected() {
        String contact = "student2@example.com";
        otpService.requestOtp(contact, Role.ROLE_STUDENT);

        // Artificially expire the OTP
        OtpVerification verification = otpRepository.findTopByContactOrderByCreatedAtDesc(contact).orElseThrow();
        verification.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        otpRepository.save(verification);

        assertThrows(BadRequestException.class, () -> {
            otpService.verifyOtp(contact, "123456", Role.ROLE_STUDENT);
        });
    }

    @Test
    @DisplayName("Test 7: OTP cannot be reused after successful verification")
    void testOtpCannotBeReused() {
        String contact = "student3@example.com";
        otpService.requestOtp(contact, Role.ROLE_STUDENT);

        // First verification should succeed
        boolean verified = otpService.verifyOtp(contact, "123456", Role.ROLE_STUDENT);
        assertTrue(verified);

        // Second verification must fail
        assertThrows(BadRequestException.class, () -> {
            otpService.verifyOtp(contact, "123456", Role.ROLE_STUDENT);
        });
    }
}

