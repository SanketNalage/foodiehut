package com.foodiehut.repository;

import com.foodiehut.entity.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Long> {
    Optional<FoodCategory> findByNameIgnoreCase(String name);
    List<FoodCategory> findByActiveTrue();
}

