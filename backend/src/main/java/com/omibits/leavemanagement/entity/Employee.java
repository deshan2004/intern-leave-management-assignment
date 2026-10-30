package com.omibits.leavemanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 20)
    private String role = "EMPLOYEE";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LeaveRequest> leaveRequests = new ArrayList<>();

    public Employee() {
    }

    public Employee(String name, String email, String department, String password) {
        this(name, email, department, password, "EMPLOYEE");
    }

    public Employee(String name, String email, String department, String password, String role) {
        this.name = name;
        this.email = email;
        this.department = department;
        this.password = password != null ? password : "password123";
        this.role = (role != null && !role.trim().isEmpty()) ? role.trim().toUpperCase() : "EMPLOYEE";
    }

    public Employee(String name, String email, String department) {
        this(name, email, department, "password123", "EMPLOYEE");
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.password == null || this.password.trim().isEmpty()) {
            this.password = "password123";
        }
        if (this.role == null || this.role.trim().isEmpty()) {
            this.role = "EMPLOYEE";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = (role != null && !role.trim().isEmpty()) ? role.trim().toUpperCase() : "EMPLOYEE";
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<LeaveRequest> getLeaveRequests() {
        return leaveRequests;
    }

    public void setLeaveRequests(List<LeaveRequest> leaveRequests) {
        this.leaveRequests = leaveRequests;
    }
}
