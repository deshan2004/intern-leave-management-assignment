-- =============================================================================
-- Employee Leave Management System - Relational Database Schema
-- Database: PostgreSQL 16 / Relational RDBMS
-- Company: Omibits (Pvt) Ltd. Technical Assessment
-- =============================================================================

-- 1. Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by email during authentication & duplicate checks
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- 2. Create Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(100),
    attachment_data TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Relationship: Employee (1) -> LeaveRequest (N) with CASCADE
    CONSTRAINT fk_leave_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees (id) 
        ON DELETE CASCADE,

    -- Database Constraint: Ensure leave_type is valid
    CONSTRAINT chk_leave_type 
        CHECK (leave_type IN ('ANNUAL', 'CASUAL', 'MEDICAL')),

    -- Database Constraint: Ensure status is valid
    CONSTRAINT chk_leave_status 
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),

    -- Database Constraint: End date must be on or after start date
    CONSTRAINT chk_leave_dates 
        CHECK (end_date >= start_date)
);

-- Indexes for performance & quick filtering
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created ON leave_requests(created_at DESC);
