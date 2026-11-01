package com.foodiehut.service;

import com.foodiehut.dto.OrderDto;
import com.foodiehut.dto.StudentDto;
import com.foodiehut.dto.StudentRegisterRequest;
import com.foodiehut.entity.Order;
import com.foodiehut.entity.Student;
import com.foodiehut.entity.User;
import com.foodiehut.exception.BadRequestException;
import com.foodiehut.exception.ResourceNotFoundException;
import com.foodiehut.exception.UnauthorizedException;
import com.foodiehut.repository.OrderRepository;
import com.foodiehut.repository.StudentRepository;
import com.foodiehut.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public StudentService(StudentRepository studentRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public StudentDto getProfileByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));
        return StudentDto.fromEntity(student);
    }

    @Transactional
    public StudentDto updateProfile(Long userId, StudentRegisterRequest req) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        User user = student.getUser();
        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }
        if (req.getCollege() != null) {
            student.setCollege(req.getCollege().trim());
        }
        if (req.getStudentIdNumber() != null) {
            student.setStudentIdNumber(req.getStudentIdNumber().trim());
        }
        if (req.getSection() != null) {
            student.setSection(req.getSection().trim());
        }

        userRepository.save(user);
        student = studentRepository.save(student);
        return StudentDto.fromEntity(student);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        return orderRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(OrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getMyOrder(Long userId, Long orderId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You are not authorized to view this order.");
        }

        return OrderDto.fromEntity(order);
    }
}
