package com.foodiehut.service;

import com.foodiehut.dto.CanteenAnalyticsDto;
import com.foodiehut.dto.CanteenDto;
import com.foodiehut.dto.CanteenRegisterRequest;
import com.foodiehut.entity.Canteen;
import com.foodiehut.entity.Order;
import com.foodiehut.entity.OrderStatus;
import com.foodiehut.entity.User;
import com.foodiehut.exception.ResourceNotFoundException;
import com.foodiehut.repository.CanteenRepository;
import com.foodiehut.repository.OrderRepository;
import com.foodiehut.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CanteenService {

    private final CanteenRepository canteenRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public CanteenService(CanteenRepository canteenRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.canteenRepository = canteenRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public CanteenDto getByCode(String canteenCode) {
        Canteen canteen = canteenRepository.findByCanteenCode(canteenCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found with code: " + canteenCode));
        return CanteenDto.fromEntity(canteen);
    }

    @Transactional(readOnly = true)
    public CanteenDto getProfileByUserId(Long userId) {
        Canteen canteen = canteenRepository.findByOwnerId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + userId));
        return CanteenDto.fromEntity(canteen);
    }

    @Transactional(readOnly = true)
    public List<CanteenDto> getAllActiveCanteens() {
        return canteenRepository.findByActiveTrue()
                .stream()
                .map(CanteenDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CanteenDto updateProfile(Long userId, CanteenRegisterRequest req) {
        Canteen canteen = canteenRepository.findByOwnerId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + userId));

        User owner = canteen.getOwner();
        if (req.getOwnerName() != null && !req.getOwnerName().isBlank()) {
            owner.setFullName(req.getOwnerName().trim());
        }
        if (req.getCanteenName() != null && !req.getCanteenName().isBlank()) {
            canteen.setCanteenName(req.getCanteenName().trim());
        }
        if (req.getDescription() != null) {
            canteen.setDescription(req.getDescription().trim());
        }
        if (req.getAddress() != null) {
            canteen.setAddress(req.getAddress().trim());
        }

        userRepository.save(owner);
        canteen = canteenRepository.save(canteen);
        return CanteenDto.fromEntity(canteen);
    }

    @Transactional(readOnly = true)
    public CanteenAnalyticsDto getAnalytics(Long userId) {
        Canteen canteen = canteenRepository.findByOwnerId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + userId));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<Order> todayOrders = orderRepository.findRecentOrdersByCanteen(canteen.getId(), startOfDay);

        CanteenAnalyticsDto analytics = new CanteenAnalyticsDto();
        analytics.setTotalOrdersToday(todayOrders.size());

        long pending = orderRepository.countByCanteenIdAndStatus(canteen.getId(), OrderStatus.PLACED);
        long preparing = orderRepository.countByCanteenIdAndStatus(canteen.getId(), OrderStatus.PREPARING)
                + orderRepository.countByCanteenIdAndStatus(canteen.getId(), OrderStatus.ACCEPTED);
        long ready = orderRepository.countByCanteenIdAndStatus(canteen.getId(), OrderStatus.READY);

        long completedToday = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        BigDecimal todayRevenue = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        analytics.setPendingOrders(pending);
        analytics.setPreparingOrders(preparing);
        analytics.setReadyOrders(ready);
        analytics.setCompletedOrdersToday(completedToday);
        analytics.setTodayRevenue(todayRevenue);

        return analytics;
    }
}

