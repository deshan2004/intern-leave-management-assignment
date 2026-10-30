package com.omibits.leavemanagement.controller;

import com.omibits.leavemanagement.dto.AuthResponse;
import com.omibits.leavemanagement.dto.LoginRequest;
import com.omibits.leavemanagement.entity.Employee;
import com.omibits.leavemanagement.exception.InvalidOperationException;
import com.omibits.leavemanagement.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final EmployeeRepository employeeRepository;

    public AuthController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword().trim();

        // 1. Admin login credentials
        if (email.equals("admin@omibits.com") || email.equals("admin")) {
            if (!password.equals("admin123") && !password.equals("admin")) {
                throw new InvalidOperationException("Invalid password for administrator account.");
            }
            return ResponseEntity.ok(new AuthResponse(
                    0L,
                    "System Administrator",
                    "admin@omibits.com",
                    "Operations & Management",
                    "ADMIN"
            ));
        }

        // 2. Employee login: match against database record
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidOperationException("No employee account registered with email: " + email));

        if (!password.equals(employee.getPassword())) {
            throw new InvalidOperationException("Invalid password. Please check your credentials.");
        }

        return ResponseEntity.ok(new AuthResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getDepartment(),
                "EMPLOYEE"
        ));
    }
}
