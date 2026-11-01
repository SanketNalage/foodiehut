package com.foodiehut.repository;

import com.foodiehut.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByContactOrderByCreatedAtDesc(String contact);
    void deleteByContact(String contact);
}
