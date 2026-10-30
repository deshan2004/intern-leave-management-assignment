package com.omibits.leavemanagement.service;

import com.omibits.leavemanagement.dto.EmployeeRequest;
import com.omibits.leavemanagement.dto.EmployeeResponse;
import com.omibits.leavemanagement.entity.Employee;
import com.omibits.leavemanagement.exception.InvalidOperationException;
import com.omibits.leavemanagement.exception.ResourceNotFoundException;
import com.omibits.leavemanagement.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public EmployeeResponse createEmployee(EmployeeRequest request) {
        String trimmedEmail = request.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByEmail(trimmedEmail)) {
            throw new InvalidOperationException("An employee with email '" + trimmedEmail + "' already exists");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "password123";

        Employee employee = new Employee(
                request.getName().trim(),
                trimmedEmail,
                request.getDepartment().trim(),
                passwordEncoder.encode(rawPassword),
                "EMPLOYEE"
        );

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .filter(emp -> !"ADMIN".equalsIgnoreCase(emp.getRole()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeEntityById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = getEmployeeEntityById(id);
        return mapToResponse(employee);
    }

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = getEmployeeEntityById(id);
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        // Check if email changed and if the new email is already used by another employee
        if (!employee.getEmail().equalsIgnoreCase(trimmedEmail) && employeeRepository.existsByEmail(trimmedEmail)) {
            throw new InvalidOperationException("An employee with email '" + trimmedEmail + "' already exists");
        }

        employee.setName(request.getName().trim());
        employee.setEmail(trimmedEmail);
        employee.setDepartment(request.getDepartment().trim());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
    }

    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeEntityById(id);
        employeeRepository.delete(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getCreatedAt()
        );
    }
}

