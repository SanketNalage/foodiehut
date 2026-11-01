package com.foodiehut.repository;

import com.foodiehut.entity.Canteen;
import com.foodiehut.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CanteenRepository extends JpaRepository<Canteen, Long> {
    Optional<Canteen> findByCanteenCode(String canteenCode);
    Optional<Canteen> findByOwner(User owner);
    Optional<Canteen> findByOwnerId(Long ownerId);
    boolean existsByCanteenCode(String canteenCode);
    List<Canteen> findByActiveTrue();
}

