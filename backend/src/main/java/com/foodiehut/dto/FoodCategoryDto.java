package com.foodiehut.dto;

import com.foodiehut.entity.FoodCategory;

public class FoodCategoryDto {
    private Long id;
    private String name;
    private boolean active;

    public FoodCategoryDto() {}

    public FoodCategoryDto(Long id, String name, boolean active) {
        this.id = id;
        this.name = name;
        this.active = active;
    }

    public static FoodCategoryDto fromEntity(FoodCategory c) {
        return new FoodCategoryDto(c.getId(), c.getName(), c.isActive());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
