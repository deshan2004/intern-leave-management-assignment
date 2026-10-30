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

        // 100% Database-Driven Authentication (Zero hardcoded credentials in source code)
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidOperationException("Invalid corporate email or password."));

        if (!password.equals(employee.getPassword())) {
            throw new InvalidOperationException("Invalid corporate email or password.");
        }

        String role = (employee.getRole() != null && !employee.getRole().trim().isEmpty())
                ? employee.getRole().trim().toUpperCase()
                : "EMPLOYEE";

        return ResponseEntity.ok(new AuthResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getDepartment(),
                role
        ));
    }
}
