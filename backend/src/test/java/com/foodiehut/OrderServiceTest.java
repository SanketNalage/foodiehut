package com.foodiehut;

import com.foodiehut.dto.OrderCreateRequest;
import com.foodiehut.dto.OrderDto;
import com.foodiehut.dto.OrderItemRequest;
import com.foodiehut.dto.OrderStatusUpdateRequest;
import com.foodiehut.entity.*;
import com.foodiehut.exception.BadRequestException;
import com.foodiehut.repository.*;
import com.foodiehut.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CanteenRepository canteenRepository;

    @Autowired
    private FoodCategoryRepository categoryRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User studentUser;
    private Student student;
    private User ownerUser;
    private Canteen canteen;
    private FoodCategory category;
    private FoodItem availableItem;
    private FoodItem unavailableItem;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        foodItemRepository.deleteAll();
        categoryRepository.deleteAll();
        canteenRepository.deleteAll();
        studentRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Student
        studentUser = userRepository.save(new User("Alice Student", "alice@example.com", "+1234567890", Role.ROLE_STUDENT));
        student = studentRepository.save(new Student(studentUser, "STU-TEST01", "MIT", "ST123", "CS-A"));

        // 2. Create Canteen
        ownerUser = userRepository.save(new User("Bob Owner", "bob@example.com", "+1987654321", Role.ROLE_CANTEEN_OWNER));
        canteen = canteenRepository.save(new Canteen(ownerUser, "Central Canteen", "CAN-TEST01", "Great food", "Building 4"));

        // 3. Category & Foods
        category = categoryRepository.save(new FoodCategory("Snacks"));
        availableItem = foodItemRepository.save(new FoodItem(
                canteen, category, "Veg Burger", "Delicious burger", new BigDecimal("45.00"), "", 10, true
        ));

        unavailableItem = new FoodItem(
                canteen, category, "Cold Coffee", "Chilled coffee", new BigDecimal("30.00"), "", 5, true
        );
        unavailableItem.setAvailable(false);
        unavailableItem = foodItemRepository.save(unavailableItem);
    }

    @Test
    @DisplayName("Test 3: Student cannot order unavailable food")
    void testCannotOrderUnavailableFood() {
        OrderCreateRequest req = new OrderCreateRequest(
                canteen.getCanteenCode(),
                List.of(new OrderItemRequest(unavailableItem.getId(), 1))
        );

        assertThrows(BadRequestException.class, () -> {
            orderService.placeOrder(studentUser.getId(), req);
        });
    }

    @Test
    @DisplayName("Test 4: Frontend cannot manipulate final price (database price is enforced)")
    void testPriceEnforcedFromDatabase() {
        // Place order for 2 Veg Burgers (DB price = 45.00 each -> expected total = 90.00)
        OrderCreateRequest req = new OrderCreateRequest(
                canteen.getCanteenCode(),
                List.of(new OrderItemRequest(availableItem.getId(), 2))
        );

        OrderDto order = orderService.placeOrder(studentUser.getId(), req);
        assertNotNull(order);
        assertEquals(new BigDecimal("90.00"), order.getTotalAmount());
        assertEquals(1, order.getItems().size());
        assertEquals(new BigDecimal("45.00"), order.getItems().get(0).getUnitPrice());
        assertEquals(new BigDecimal("90.00"), order.getItems().get(0).getSubtotal());
    }

    @Test
    @DisplayName("Test 8: Order price remains historically correct after food price changes")
    void testHistoricalPriceIntegrity() {
        // 1. Place order when price is 45.00
        OrderCreateRequest req = new OrderCreateRequest(
                canteen.getCanteenCode(),
                List.of(new OrderItemRequest(availableItem.getId(), 1))
        );
        OrderDto order = orderService.placeOrder(studentUser.getId(), req);
        assertEquals(new BigDecimal("45.00"), order.getTotalAmount());

        // 2. Change food price in canteen menu to 80.00
        availableItem.setPrice(new BigDecimal("80.00"));
        foodItemRepository.save(availableItem);

        // 3. Retrieve historical order again - total must STILL be 45.00
        Order historical = orderRepository.findById(order.getId()).orElseThrow();
        assertEquals(new BigDecimal("45.00"), historical.getTotalAmount());
        assertEquals(new BigDecimal("45.00"), historical.getItems().get(0).getUnitPrice());
    }

    @Test
    @DisplayName("Test 9: Invalid order status transitions are rejected")
    void testInvalidStatusTransitions() {
        OrderCreateRequest req = new OrderCreateRequest(
                canteen.getCanteenCode(),
                List.of(new OrderItemRequest(availableItem.getId(), 1))
        );
        OrderDto order = orderService.placeOrder(studentUser.getId(), req);
        assertEquals(OrderStatus.PLACED, order.getStatus());

        // Valid transition: PLACED -> ACCEPTED
        OrderDto accepted = orderService.updateOrderStatus(
                ownerUser.getId(), order.getId(), new OrderStatusUpdateRequest(OrderStatus.ACCEPTED)
        );
        assertEquals(OrderStatus.ACCEPTED, accepted.getStatus());

        // Invalid transition: ACCEPTED -> COMPLETED (cannot skip PREPARING and READY)
        assertThrows(BadRequestException.class, () -> {
            orderService.updateOrderStatus(
                    ownerUser.getId(), order.getId(), new OrderStatusUpdateRequest(OrderStatus.COMPLETED)
            );
        });

        // Valid transition: ACCEPTED -> PREPARING
        OrderDto preparing = orderService.updateOrderStatus(
                ownerUser.getId(), order.getId(), new OrderStatusUpdateRequest(OrderStatus.PREPARING)
        );
        assertEquals(OrderStatus.PREPARING, preparing.getStatus());

        // Valid transition: PREPARING -> READY
        OrderDto ready = orderService.updateOrderStatus(
                ownerUser.getId(), order.getId(), new OrderStatusUpdateRequest(OrderStatus.READY)
        );
        assertEquals(OrderStatus.READY, ready.getStatus());

        // Valid transition: READY -> COMPLETED
        OrderDto completed = orderService.updateOrderStatus(
                ownerUser.getId(), order.getId(), new OrderStatusUpdateRequest(OrderStatus.COMPLETED)
        );
        assertEquals(OrderStatus.COMPLETED, completed.getStatus());

        // Invalid transition: COMPLETED -> anything else
        assertThrows(BadRequestException.class, () -> {
            orderService.updateOrderStatus(
                    ownerUser.getId(), order.getId(), new OrderStatusUpdateRequest(OrderStatus.CANCELLED)
            );
        });
    }
}
