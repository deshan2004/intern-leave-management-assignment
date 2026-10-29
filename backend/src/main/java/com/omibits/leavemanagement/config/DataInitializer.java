package com.omibits.leavemanagement.config;

import com.omibits.leavemanagement.dto.EmployeeRequest;
import com.omibits.leavemanagement.dto.EmployeeResponse;
import com.omibits.leavemanagement.dto.LeaveApplicationRequest;
import com.omibits.leavemanagement.dto.RejectLeaveRequest;
import com.omibits.leavemanagement.entity.LeaveType;
import com.omibits.leavemanagement.service.EmployeeService;
import com.omibits.leavemanagement.service.LeaveService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final EmployeeService employeeService;
    private final LeaveService leaveService;

    public DataInitializer(EmployeeService employeeService, LeaveService leaveService) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
    }

    @Override
    public void run(String... args) {
        if (employeeService.getAllEmployees().isEmpty()) {
            log.info("Seeding initial demo data for Leave Management System...");

            // 1. Seed Employees
            EmployeeResponse emp1 = employeeService.createEmployee(
                    new EmployeeRequest("Kasun Perera", "kasun.perera@omibits.com", "Engineering")
            );
            EmployeeResponse emp2 = employeeService.createEmployee(
                    new EmployeeRequest("Dilini Fernando", "dilini.fernando@omibits.com", "Product Design")
            );
            EmployeeResponse emp3 = employeeService.createEmployee(
                    new EmployeeRequest("Nuwan Silva", "nuwan.silva@omibits.com", "Quality Assurance")
            );

            // 2. Seed Leaves
            // Pending Leave
            leaveService.submitLeaveRequest(new LeaveApplicationRequest(
                    emp1.getId(),
                    LeaveType.ANNUAL,
                    LocalDate.now().plusDays(5),
                    LocalDate.now().plusDays(8),
                    "Annual family vacation"
            ));

            // Approved Leave
            var leave2 = leaveService.submitLeaveRequest(new LeaveApplicationRequest(
                    emp2.getId(),
                    LeaveType.CASUAL,
                    LocalDate.now().plusDays(2),
                    LocalDate.now().plusDays(3),
                    "Personal urgent errand"
            ));
            leaveService.approveLeaveRequest(leave2.getId());

            // Rejected Leave
            var leave3 = leaveService.submitLeaveRequest(new LeaveApplicationRequest(
                    emp3.getId(),
                    LeaveType.MEDICAL,
                    LocalDate.now().minusDays(3),
                    LocalDate.now().minusDays(1),
                    "Viral fever recovery"
            ));
            leaveService.rejectLeaveRequest(leave3.getId(), new RejectLeaveRequest("Medical certificate was not attached"));

            log.info("Sample data initialized successfully.");
        }
    }
}

