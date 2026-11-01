package com.foodiehut.service;

import com.foodiehut.dto.*;
import com.foodiehut.entity.*;
import com.foodiehut.exception.BadRequestException;
import com.foodiehut.exception.ResourceNotFoundException;
import com.foodiehut.exception.UnauthorizedException;
import com.foodiehut.repository.CanteenRepository;
import com.foodiehut.repository.FoodItemRepository;
import com.foodiehut.repository.OrderRepository;
import com.foodiehut.repository.StudentRepository;
import com.foodiehut.websocket.OrderEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StudentRepository studentRepository;
    private final CanteenRepository canteenRepository;
    private final FoodItemRepository foodItemRepository;
    private final OrderEventPublisher orderEventPublisher;
    private final SecureRandom random = new SecureRandom();

    public OrderService(OrderRepository orderRepository,
                        StudentRepository studentRepository,
                        CanteenRepository canteenRepository,
                        FoodItemRepository foodItemRepository,
                        OrderEventPublisher orderEventPublisher) {
        this.orderRepository = orderRepository;
        this.studentRepository = studentRepository;
        this.canteenRepository = canteenRepository;
        this.foodItemRepository = foodItemRepository;
        this.orderEventPublisher = orderEventPublisher;
    }

    @Transactional
    public OrderDto placeOrder(Long studentUserId, OrderCreateRequest req) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + studentUserId));

        Canteen canteen = canteenRepository.findByCanteenCode(req.getCanteenCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found with code: " + req.getCanteenCode()));

        if (!canteen.isActive()) {
            throw new BadRequestException("Canteen " + canteen.getCanteenName() + " is currently closed/inactive.");
        }

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new BadRequestException("Order must have at least one food item.");
        }

        String orderNumber = generateOrderNumber();
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = new Order(orderNumber, student, canteen, BigDecimal.ZERO);

        for (OrderItemRequest itemReq : req.getItems()) {
            FoodItem foodItem = foodItemRepository.findById(itemReq.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + itemReq.getFoodItemId()));

            if (!foodItem.getCanteen().getId().equals(canteen.getId())) {
                throw new BadRequestException("Item '" + foodItem.getName() + "' does not belong to canteen " + canteen.getCanteenName());
            }

            if (!foodItem.isActive() || !foodItem.isAvailable()) {
                throw new BadRequestException("Item '" + foodItem.getName() + "' is currently unavailable and cannot be ordered.");
            }

            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than zero for " + foodItem.getName());
            }

            // Always take snapshot of unitPrice directly from Database
            BigDecimal unitPrice = foodItem.getPrice();
            OrderItem orderItem = new OrderItem(foodItem, foodItem.getName(), unitPrice, itemReq.getQuantity());
            order.addItem(orderItem);

            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        OrderDto dto = OrderDto.fromEntity(order);

        // Publish live real-time event via WebSocket
        orderEventPublisher.publishOrderCreated(dto);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getCanteenOrders(Long ownerUserId) {
        Canteen canteen = canteenRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + ownerUserId));

        return orderRepository.findByCanteenIdOrderByCreatedAtDesc(canteen.getId())
                .stream()
                .map(OrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatus(Long ownerUserId, Long orderId, OrderStatusUpdateRequest req) {
        Canteen canteen = canteenRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner id: " + ownerUserId));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getCanteen().getId().equals(canteen.getId())) {
            throw new UnauthorizedException("You are not authorized to update orders for another canteen.");
        }

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = req.getStatus();

        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.CANCELLED && req.getCancellationReason() != null) {
            order.setCancellationReason(req.getCancellationReason().trim());
        }

        order = orderRepository.save(order);
        OrderDto dto = OrderDto.fromEntity(order);

        // Publish live real-time status update via WebSocket
        orderEventPublisher.publishOrderStatusUpdated(dto);

        return dto;
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long userId, Role role, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (role == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + userId));
            if (!order.getStudent().getId().equals(student.getId())) {
                throw new UnauthorizedException("You are not authorized to view another student's order.");
            }
        } else if (role == Role.ROLE_CANTEEN_OWNER) {
            Canteen canteen = canteenRepository.findByOwnerId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Canteen not found for owner: " + userId));
            if (!order.getCanteen().getId().equals(canteen.getId())) {
                throw new UnauthorizedException("You are not authorized to view another canteen's order.");
            }
        }

        return OrderDto.fromEntity(order);
    }

    private String generateOrderNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int randomSuffix = 100000 + random.nextInt(900000);
        return "ORD-" + datePrefix + "-" + randomSuffix;
    }
}

