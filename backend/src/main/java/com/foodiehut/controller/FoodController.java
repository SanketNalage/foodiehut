package com.foodiehut.controller;

import com.foodiehut.dto.ApiResponse;
import com.foodiehut.dto.FoodAvailabilityRequest;
import com.foodiehut.dto.FoodCategoryDto;
import com.foodiehut.dto.FoodItemCreateRequest;
import com.foodiehut.dto.FoodItemDto;
import com.foodiehut.security.UserPrincipal;
import com.foodiehut.service.FoodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Food Management", description = "Food item catalog, category, and canteen menu management APIs")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping("/categories")
    @Operation(summary = "Get list of available food categories")
    public ResponseEntity<ApiResponse<List<FoodCategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(foodService.getAllCategories()));
    }

    @GetMapping("/canteens/me/foods")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Get all food items belonging to the authenticated canteen")
    public ResponseEntity<ApiResponse<List<FoodItemDto>>> getOwnerFoodItems(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(foodService.getOwnerFoodItems(principal.getId())));
    }

    @PostMapping("/canteens/me/foods")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Add a new food item to canteen menu")
    public ResponseEntity<ApiResponse<FoodItemDto>> addFoodItem(@AuthenticationPrincipal UserPrincipal principal,
                                                                @Valid @RequestBody FoodItemCreateRequest req) {
        FoodItemDto created = foodService.addFoodItem(principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Food item created successfully.", created));
    }

    @PutMapping("/canteens/me/foods/{foodId}")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Edit an existing food item")
    public ResponseEntity<ApiResponse<FoodItemDto>> updateFoodItem(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable Long foodId,
                                                                   @Valid @RequestBody FoodItemCreateRequest req) {
        FoodItemDto updated = foodService.updateFoodItem(principal.getId(), foodId, req);
        return ResponseEntity.ok(ApiResponse.ok("Food item updated successfully.", updated));
    }

    @PatchMapping("/canteens/me/foods/{foodId}/availability")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Toggle food item availability (Available / Unavailable)")
    public ResponseEntity<ApiResponse<FoodItemDto>> toggleAvailability(@AuthenticationPrincipal UserPrincipal principal,
                                                                       @PathVariable Long foodId,
                                                                       @Valid @RequestBody FoodAvailabilityRequest req) {
        FoodItemDto updated = foodService.toggleAvailability(principal.getId(), foodId, req.getAvailable());
        return ResponseEntity.ok(ApiResponse.ok("Food item availability updated.", updated));
    }

    @DeleteMapping("/canteens/me/foods/{foodId}")
    @PreAuthorize("hasAuthority('ROLE_CANTEEN_OWNER')")
    @Operation(summary = "Soft delete / deactivate a food item from canteen menu")
    public ResponseEntity<ApiResponse<Void>> deleteFoodItem(@AuthenticationPrincipal UserPrincipal principal,
                                                            @PathVariable Long foodId) {
        foodService.deleteFoodItem(principal.getId(), foodId);
        return ResponseEntity.ok(ApiResponse.ok("Food item removed successfully.", null));
    }
}
