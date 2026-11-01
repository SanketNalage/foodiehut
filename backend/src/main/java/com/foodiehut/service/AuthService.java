package com.foodiehut.service;

import com.foodiehut.dto.*;
import com.foodiehut.entity.*;
import com.foodiehut.exception.BadRequestException;
import com.foodiehut.exception.ResourceNotFoundException;
import com.foodiehut.repository.CanteenRepository;
import com.foodiehut.repository.StudentRepository;
import com.foodiehut.repository.UserRepository;
import com.foodiehut.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CanteenRepository canteenRepository;
    private final OtpService otpService;
    private final QrCodeService qrCodeService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public AuthService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       CanteenRepository canteenRepository,
                       OtpService otpService,
                       QrCodeService qrCodeService,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.canteenRepository = canteenRepository;
        this.otpService = otpService;
        this.qrCodeService = qrCodeService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public StudentDto registerStudent(StudentRegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        String phone = req.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " already exists.");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new BadRequestException("An account with phone " + phone + " already exists.");
        }

        User user = new User(req.getFullName().trim(), email, phone, Role.ROLE_STUDENT);
        user = userRepository.save(user);

        String studentCode = generateUniqueCode("STU");
        Student student = new Student(user, studentCode, req.getCollege(), req.getStudentIdNumber(), req.getSection());

        String qrPayload = frontendBaseUrl + "/student/" + studentCode;
        String qrBase64 = qrCodeService.generateQrCodeDataUrl(qrPayload, 300, 300);
        student.setQrCodeData(qrBase64);

        student = studentRepository.save(student);

        // Pre-request OTP for verification
        otpService.requestOtp(email, Role.ROLE_STUDENT);

        return StudentDto.fromEntity(student);
    }

    @Transactional
    public CanteenDto registerCanteen(CanteenRegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        String phone = req.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " already exists.");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new BadRequestException("An account with phone " + phone + " already exists.");
        }

        User user = new User(req.getOwnerName().trim(), email, phone, Role.ROLE_CANTEEN_OWNER);
        user = userRepository.save(user);

        String canteenCode = generateUniqueCode("CAN");
        Canteen canteen = new Canteen(user, req.getCanteenName().trim(), canteenCode, req.getDescription(), req.getAddress());

        String qrPayload = frontendBaseUrl + "/canteen/" + canteenCode;
        String qrBase64 = qrCodeService.generateQrCodeDataUrl(qrPayload, 300, 300);
        canteen.setQrCodeData(qrBase64);

        canteen = canteenRepository.save(canteen);

        // Pre-request OTP for verification
        otpService.requestOtp(email, Role.ROLE_CANTEEN_OWNER);

        return CanteenDto.fromEntity(canteen);
    }

    public String requestOtp(OtpRequestDto req) {
        String contact = req.getContact().trim().toLowerCase();
        // Check if user exists
        Optional<User> userOpt = userRepository.findByEmail(contact).or(() -> userRepository.findByPhone(contact));
        if (userOpt.isEmpty()) {
            throw new ResourceNotFoundException("No account found for contact: " + contact + ". Please register first.");
        }
        User user = userOpt.get();
        if (user.getRole() != req.getRole()) {
            throw new BadRequestException("Account belongs to role " + user.getRole() + ", but requested for " + req.getRole());
        }

        return otpService.requestOtp(contact, req.getRole());
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyDto req) {
        String contact = req.getContact().trim().toLowerCase();
        otpService.verifyOtp(contact, req.getOtp().trim(), req.getRole());

        User user = userRepository.findByEmail(contact)
                .or(() -> userRepository.findByPhone(contact))
                .orElseThrow(() -> new ResourceNotFoundException("User not found for contact: " + contact));

        if (!user.isActive()) {
            throw new BadRequestException("User account is disabled. Please contact support.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        Object profile = null;
        if (user.getRole() == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found."));
            profile = StudentDto.fromEntity(student);
        } else if (user.getRole() == Role.ROLE_CANTEEN_OWNER) {
            Canteen canteen = canteenRepository.findByOwnerId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Canteen profile not found."));
            profile = CanteenDto.fromEntity(canteen);
        }

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole(), profile);
    }

    private String generateUniqueCode(String prefix) {
        String chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder(prefix).append("-");
            for (int c = 0; c < 6; c++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            String code = sb.toString();
            if (prefix.equals("CAN") && !canteenRepository.existsByCanteenCode(code)) {
                return code;
            }
            if (prefix.equals("STU") && !studentRepository.existsByStudentCode(code)) {
                return code;
            }
        }
        return prefix + "-" + System.currentTimeMillis();
    }
}

