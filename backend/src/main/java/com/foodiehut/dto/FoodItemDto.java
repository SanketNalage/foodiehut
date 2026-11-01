package com.foodiehut.dto;

import com.foodiehut.entity.FoodItem;
import java.math.BigDecimal;

public class FoodItemDto {
    private Long id;
    private Long canteenId;
    private String canteenName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer preparationTime;
    private Boolean isVeg;
    private boolean available;
    private boolean active;

    public FoodItemDto() {}

    public static FoodItemDto fromEntity(FoodItem item) {
        FoodItemDto dto = new FoodItemDto();
        dto.setId(item.getId());
        dto.setCanteenId(item.getCanteen().getId());
        dto.setCanteenName(item.getCanteen().getCanteenName());
        dto.setCategoryId(item.getCategory().getId());
        dto.setCategoryName(item.getCategory().getName());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setImageUrl(item.getImageUrl());
        dto.setPreparationTime(item.getPreparationTime());
        dto.setIsVeg(item.getIsVeg());
        dto.setAvailable(item.isAvailable());
        dto.setActive(item.isActive());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCanteenId() { return canteenId; }
    public void setCanteenId(Long canteenId) { this.canteenId = canteenId; }
    public String getCanteenName() { return canteenName; }
    public void setCanteenName(String canteenName) { this.canteenName = canteenName; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getPreparationTime() { return preparationTime; }
    public void setPreparationTime(Integer preparationTime) { this.preparationTime = preparationTime; }
    public Boolean getIsVeg() { return isVeg; }
    public void setIsVeg(Boolean isVeg) { this.isVeg = isVeg; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

