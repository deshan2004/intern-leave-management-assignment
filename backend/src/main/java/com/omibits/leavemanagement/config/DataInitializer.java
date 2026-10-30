package com.omibits.leavemanagement.config;

import com.omibits.leavemanagement.entity.Employee;
import com.omibits.leavemanagement.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final EmployeeRepository employeeRepository;

    @Value("${app.admin.name:System Administrator}")
    private String adminName;

    @Value("${app.admin.email:admin@omibits.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public DataInitializer(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public void run(String... args) {
        // Automatically initialize default Administrator account in the database if not present
        if (!employeeRepository.existsByEmail(adminEmail)) {
            Employee admin = new Employee(
                    adminName,
                    adminEmail,
                    "Management",
                    adminPassword,
                    "ADMIN"
            );
            employeeRepository.save(admin);
            log.info("Default administrator account initialized in database: {}", adminEmail);
        }
        log.info("Leave Management System database connected and ready for operations.");
    }
}
