package com.omibits.leavemanagement.service;

import com.omibits.leavemanagement.dto.EmployeeRequest;
import com.omibits.leavemanagement.dto.EmployeeResponse;
import com.omibits.leavemanagement.entity.Employee;
import com.omibits.leavemanagement.exception.InvalidOperationException;
import com.omibits.leavemanagement.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private EmployeeRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new EmployeeRequest("Kasun Perera", "kasun@omibits.com", "Engineering");
    }

    @Test
    @DisplayName("Should create employee successfully when email is unique")
    void shouldCreateEmployeeSuccessfully() {
        when(employeeRepository.existsByEmail("kasun@omibits.com")).thenReturn(false);

        Employee savedEmployee = new Employee("Kasun Perera", "kasun@omibits.com", "Engineering");
        savedEmployee.setId(1L);
        savedEmployee.setCreatedAt(LocalDateTime.now());

        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);

        EmployeeResponse response = employeeService.createEmployee(validRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Kasun Perera", response.getName());
        assertEquals("kasun@omibits.com", response.getEmail());
        assertEquals("Engineering", response.getDepartment());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    @DisplayName("Should throw InvalidOperationException when email already exists")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        when(employeeRepository.existsByEmail("kasun@omibits.com")).thenReturn(true);

        InvalidOperationException exception = assertThrows(InvalidOperationException.class, () ->
                employeeService.createEmployee(validRequest)
        );

        assertTrue(exception.getMessage().contains("already exists"));
        verify(employeeRepository, never()).save(any(Employee.class));
    }
}

