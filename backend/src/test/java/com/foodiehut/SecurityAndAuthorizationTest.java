package com.foodiehut;

import com.foodiehut.dto.OrderCreateRequest;
import com.foodiehut.dto.OrderDto;
import com.foodiehut.dto.OrderItemRequest;
import com.foodiehut.dto.OrderStatusUpdateRequest;
import com.foodiehut.entity.*;
import com.foodiehut.exception.UnauthorizedException;
import com.foodiehut.repository.*;
import com.foodiehut.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
public class SecurityAndAuthorizationTest {

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

    private User student1User;
    private User student2User;
    private User owner1User;
    private User owner2User;
    private Canteen canteen1;
    private Canteen canteen2;
    private FoodItem item1;
    private Order order1;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        foodItemRepository.deleteAll();
        categoryRepository.deleteAll();
        canteenRepository.deleteAll();
        studentRepository.deleteAll();
        userRepository.deleteAll();

        student1User = userRepository.save(new User("Student One", "stu1@test.com", "1111111111", Role.ROLE_STUDENT));
        studentRepository.save(new Student(student1User, "STU-1", "College A", "S1", "Sec-A"));

        student2User = userRepository.save(new User("Student Two", "stu2@test.com", "2222222222", Role.ROLE_STUDENT));
        studentRepository.save(new Student(student2User, "STU-2", "College B", "S2", "Sec-B"));

        owner1User = userRepository.save(new User("Owner One", "owner1@test.com", "3333333333", Role.ROLE_CANTEEN_OWNER));
        canteen1 = canteenRepository.save(new Canteen(owner1User, "Canteen One", "CAN-001", "Canteen 1", "Spot 1"));

        owner2User = userRepository.save(new User("Owner Two", "owner2@test.com", "4444444444", Role.ROLE_CANTEEN_OWNER));
        canteen2 = canteenRepository.save(new Canteen(owner2User, "Canteen Two", "CAN-002", "Canteen 2", "Spot 2"));

        FoodCategory cat = categoryRepository.save(new FoodCategory("Meals"));
        item1 = foodItemRepository.save(new FoodItem(
                canteen1, cat, "Thali", "Deluxe Thali", new BigDecimal("120.00"), "", 15, true
        ));

        // Student 1 places an order in Canteen 1
        OrderCreateRequest req = new OrderCreateRequest(
                canteen1.getCanteenCode(),
                List.of(new OrderItemRequest(item1.getId(), 1))
        );
        OrderDto created = orderService.placeOrder(student1User.getId(), req);
        order1 = orderRepository.findById(created.getId()).orElseThrow();
    }

    @Test
    @DisplayName("Test 1: Student cannot access another student's order")
    void testStudentCannotAccessOtherStudentOrder() {
        assertThrows(UnauthorizedException.class, () -> {
            orderService.getOrderById(student2User.getId(), Role.ROLE_STUDENT, order1.getId());
        });
    }

    @Test
    @DisplayName("Test 2: Canteen owner cannot access or update another canteen's order")
    void testOwnerCannotUpdateOtherCanteenOrder() {
        // Owner 2 tries to update status of an order that belongs to Canteen 1
        assertThrows(UnauthorizedException.class, () -> {
            orderService.updateOrderStatus(
                    owner2User.getId(), order1.getId(), new OrderStatusUpdateRequest(OrderStatus.ACCEPTED)
            );
        });

        // Owner 2 tries to read details of an order that belongs to Canteen 1
        assertThrows(UnauthorizedException.class, () -> {
            orderService.getOrderById(owner2User.getId(), Role.ROLE_CANTEEN_OWNER, order1.getId());
        });
    }
}
