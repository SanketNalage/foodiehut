package com.foodiehut.repository;

import com.foodiehut.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByCanteenIdAndActiveTrue(Long canteenId);
    List<FoodItem> findByCanteenId(Long canteenId);
    List<FoodItem> findByCanteenIdAndCategoryIdAndActiveTrue(Long canteenId, Long categoryId);
    Optional<FoodItem> findByIdAndCanteenId(Long id, Long canteenId);
}

