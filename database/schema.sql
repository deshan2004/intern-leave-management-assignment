-- =============================================================================
-- Employee Leave Management System - Relational Database Schema
-- Database: PostgreSQL / Relational RDBMS
-- =============================================================================

-- 1. Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by email during registration duplicate check
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
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Relationship: Employee (1) -> LeaveRequest (N)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created ON leave_requests(created_at DESC);

-- =============================================================================
-- Initial Demo / Seed Data
-- =============================================================================
INSERT INTO employees (name, email, department) VALUES
('Kasun Perera', 'kasun.perera@omibits.com', 'Engineering'),
('Dilini Fernando', 'dilini.fernando@omibits.com', 'Product Design'),
('Nuwan Silva', 'nuwan.silva@omibits.com', 'Quality Assurance')
ON CONFLICT (email) DO NOTHING;

INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, rejection_reason) VALUES
(1, 'ANNUAL', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '8 days', 'Annual family vacation', 'PENDING', NULL),
(2, 'CASUAL', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 'Personal urgent errand', 'APPROVED', NULL),
(3, 'MEDICAL', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '1 day', 'Viral fever recovery', 'REJECTED', 'Medical certificate was not attached');
