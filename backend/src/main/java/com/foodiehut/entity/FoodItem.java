package com.foodiehut.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_items", indexes = {
    @Index(name = "idx_food_canteen", columnList = "canteen_id"),
    @Index(name = "idx_food_category", columnList = "category_id")
})
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "canteen_id", nullable = false)
    private Canteen canteen;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private FoodCategory category;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 600)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Integer preparationTime = 10; // in minutes

    @Column(nullable = false)
    private Boolean isVeg = true;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private boolean active = true; // Soft delete

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public FoodItem() {}

    public FoodItem(Canteen canteen, FoodCategory category, String name, String description,
                    BigDecimal price, String imageUrl, Integer preparationTime, Boolean isVeg) {
        this.canteen = canteen;
        this.category = category;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.preparationTime = preparationTime != null ? preparationTime : 10;
        this.isVeg = isVeg != null ? isVeg : true;
        this.available = true;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Canteen getCanteen() { return canteen; }
    public void setCanteen(Canteen canteen) { this.canteen = canteen; }
    public FoodCategory getCategory() { return category; }
    public void setCategory(FoodCategory category) { this.category = category; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

