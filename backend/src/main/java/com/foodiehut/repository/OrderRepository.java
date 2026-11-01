package com.foodiehut.repository;

import com.foodiehut.entity.Order;
import com.foodiehut.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<Order> findByCanteenIdOrderByCreatedAtDesc(Long canteenId);
    List<Order> findByCanteenIdAndStatusOrderByCreatedAtDesc(Long canteenId, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.canteen.id = :canteenId AND o.createdAt >= :since ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByCanteen(@Param("canteenId") Long canteenId, @Param("since") LocalDateTime since);

    long countByCanteenIdAndStatus(Long canteenId, OrderStatus status);
}

