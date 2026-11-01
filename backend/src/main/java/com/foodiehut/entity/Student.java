package com.foodiehut.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_student_code", columnList = "studentCode", unique = true)
})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 32)
    private String studentCode;

    @Column(length = 150)
    private String college;

    @Column(length = 50)
    private String studentIdNumber;

    @Column(length = 50)
    private String section;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String qrCodeData;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Student() {}

    public Student(User user, String studentCode, String college, String studentIdNumber, String section) {
        this.user = user;
        this.studentCode = studentCode;
        this.college = college;
        this.studentIdNumber = studentIdNumber;
        this.section = section;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getStudentIdNumber() { return studentIdNumber; }
    public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

