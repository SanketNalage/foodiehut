package com.foodiehut.service;

import com.foodiehut.dto.FoodCategoryDto;
import com.foodiehut.dto.FoodItemCreateRequest;
import com.foodiehut.dto.FoodItemDto;
import com.foodiehut.entity.Canteen;
import com.foodiehut.entity.FoodCategory;
import com.foodiehut.entity.FoodItem;
import com.foodiehut.exception.BadRequestException;
import com.foodiehut.exception.ResourceNotFoundException;
import com.foodiehut.exception.UnauthorizedException;
import com.foodiehut.repository.CanteenRepository;
import com.foodiehut.repository.FoodCategoryRepository;
import com.foodiehut.repository.FoodItemRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoodService {

    private final FoodItemRepository foodItemRepository;
    private final FoodCategoryRepository categoryRepository;
    private final CanteenRepository canteenRepository;

    public FoodService(FoodItemRepository foodItemRepository,
                       FoodCategoryRepository categoryRepository,
                       CanteenRepository canteenRepository) {
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
        this.canteenRepository = canteenRepository;
    }

    @PostConstruct
    @Transactional
    public void initDefaultCategories() {
        if (categoryRepository.count() == 0) {
            List<String> defaults = Arrays.asList(
                    "Breakfast", "Lunch", "Snacks", "Beverages", "Fast Food", "Main Course", "Desserts", "Other"
            );
            for (String cat : defaults) {
                categoryRepository.save(new FoodCategory(cat));
            }
        }
    }

    @Transactional(readOnly = true)
    public List<FoodCategoryDto> getAllCategories() {
        return categoryRepository.findByActiveTrue()
                .stream()
                .map(FoodCategoryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FoodItemDto> getMenuByCanteenCode(String canteenCode) {
        Canteen canteen = canteenRepository.findByCanteenCode(canteenCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found with code: " + canteenCode));

        return foodItemRepository.findByCanteenIdAndActiveTrue(canteen.getId())
                .stream()
                .map(FoodItemDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FoodItemDto> getOwnerFoodItems(Long ownerUserId) {
        Canteen canteen = canteenRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + ownerUserId));

        return foodItemRepository.findByCanteenIdAndActiveTrue(canteen.getId())
                .stream()
                .map(FoodItemDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public FoodItemDto addFoodItem(Long ownerUserId, FoodItemCreateRequest req) {
        Canteen canteen = canteenRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + ownerUserId));

        FoodCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + req.getCategoryId()));

        FoodItem item = new FoodItem(
                canteen,
                category,
                req.getName().trim(),
                req.getDescription() != null ? req.getDescription().trim() : "",
                req.getPrice(),
                req.getImageUrl(),
                req.getPreparationTime(),
                req.getIsVeg()
        );
        if (req.getAvailable() != null) {
            item.setAvailable(req.getAvailable());
        }

        item = foodItemRepository.save(item);
        return FoodItemDto.fromEntity(item);
    }

    @Transactional
    public FoodItemDto updateFoodItem(Long ownerUserId, Long foodId, FoodItemCreateRequest req) {
        Canteen canteen = canteenRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + ownerUserId));

        FoodItem item = foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + foodId));

        if (!item.getCanteen().getId().equals(canteen.getId())) {
            throw new UnauthorizedException("You do not own this food item.");
        }

        FoodCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + req.getCategoryId()));

        item.setCategory(category);
        item.setName(req.getName().trim());
        item.setDescription(req.getDescription() != null ? req.getDescription().trim() : "");
        item.setPrice(req.getPrice());
        item.setImageUrl(req.getImageUrl());
        if (req.getPreparationTime() != null) {
            item.setPreparationTime(req.getPreparationTime());
        }
        if (req.getIsVeg() != null) {
            item.setIsVeg(req.getIsVeg());
        }
        if (req.getAvailable() != null) {
            item.setAvailable(req.getAvailable());
        }

        item = foodItemRepository.save(item);
        return FoodItemDto.fromEntity(item);
    }

    @Transactional
    public FoodItemDto toggleAvailability(Long ownerUserId, Long foodId, boolean available) {
        Canteen canteen = canteenRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + ownerUserId));

        FoodItem item = foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + foodId));

        if (!item.getCanteen().getId().equals(canteen.getId())) {
            throw new UnauthorizedException("You do not own this food item.");
        }

        item.setAvailable(available);
        item = foodItemRepository.save(item);
        return FoodItemDto.fromEntity(item);
    }

    @Transactional
    public void deleteFoodItem(Long ownerUserId, Long foodId) {
        Canteen canteen = canteenRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + ownerUserId));

        FoodItem item = foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + foodId));

        if (!item.getCanteen().getId().equals(canteen.getId())) {
            throw new UnauthorizedException("You do not own this food item.");
        }

        // Soft delete to protect historical order integrity
        item.setActive(false);
        item.setAvailable(false);
        foodItemRepository.save(item);
    }
}

