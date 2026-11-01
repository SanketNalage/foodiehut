package com.foodiehut.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StudentRegisterRequest {

    @NotBlank(message = "Student name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Phone number format is invalid")
    private String phone;

    private String college;
    private String studentIdNumber;
    private String section;

    public StudentRegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getStudentIdNumber() { return studentIdNumber; }
    public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
}

