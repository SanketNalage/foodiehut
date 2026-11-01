package com.foodiehut.dto;

import com.foodiehut.entity.Student;

public class StudentDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String studentCode;
    private String college;
    private String studentIdNumber;
    private String section;
    private String qrCodeData;

    public StudentDto() {}

    public static StudentDto fromEntity(Student s) {
        StudentDto dto = new StudentDto();
        dto.setId(s.getId());
        dto.setUserId(s.getUser().getId());
        dto.setFullName(s.getUser().getFullName());
        dto.setEmail(s.getUser().getEmail());
        dto.setPhone(s.getUser().getPhone());
        dto.setStudentCode(s.getStudentCode());
        dto.setCollege(s.getCollege());
        dto.setStudentIdNumber(s.getStudentIdNumber());
        dto.setSection(s.getSection());
        dto.setQrCodeData(s.getQrCodeData());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
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
}

