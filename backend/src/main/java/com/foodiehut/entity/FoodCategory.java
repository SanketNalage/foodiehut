package com.foodiehut.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "food_categories", indexes = {
    @Index(name = "idx_category_name", columnList = "name", unique = true)
})
public class FoodCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    public FoodCategory() {}

    public FoodCategory(String name) {
        this.name = name;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
