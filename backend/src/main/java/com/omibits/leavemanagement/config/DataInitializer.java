package com.omibits.leavemanagement.config;

import com.omibits.leavemanagement.entity.Employee;
import com.omibits.leavemanagement.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name:System Administrator}")
    private String adminName;

    @Value("${app.admin.email:admin@omibits.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public DataInitializer(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Automatically initialize default Administrator account in the database if not present
        if (!employeeRepository.existsByEmail(adminEmail)) {
            Employee admin = new Employee(
                    adminName,
                    adminEmail,
                    "Management",
                    passwordEncoder.encode(adminPassword),
                    "ADMIN"
            );
            employeeRepository.save(admin);
            log.info("Default administrator account initialized in database with BCrypt hash: {}", adminEmail);
        }

        // 2. Automatically upgrade any legacy plain-text passwords in the database to BCrypt hashes
        employeeRepository.findAll().forEach(emp -> {
            String pwd = emp.getPassword();
            if (pwd != null && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$") && !pwd.startsWith("$2y$")) {
                emp.setPassword(passwordEncoder.encode(pwd));
                employeeRepository.save(emp);
                log.info("Securely migrated password to BCrypt hash for user: {}", emp.getEmail());
            }
        });

        log.info("Leave Management System database connected and verified for secure operations.");
    }
}
