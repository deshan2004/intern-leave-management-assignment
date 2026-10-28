# Employee Leave Management System

A robust full-stack web application designed for managing employee leave applications and administrative workflows. Built as part of the Software Engineering Intern Technical Assessment for **Omibits (Pvt) Ltd.**

---

## Tech Stack & Architecture

- **Backend:** Java 17, Spring Boot 3 (REST APIs, Spring Data JPA, Hibernate, Bean Validation)
- **Frontend:** React 18 (Vite, Tailwind CSS, Axios, Lucide Icons)
- **Database:** PostgreSQL (with H2 in-memory profile available for rapid testing)
- **Testing:** JUnit 5, Mockito
- **Architecture:** Layered Architecture (Controller -> Service -> Repository -> Database) to isolate business logic from presentation and persistence layers.

---

## Features

### Employee Management
- Register employees with full name, corporate email, and department.
- Strict email format validation and duplicate prevention.
- View real-time roster of registered personnel.

### Leave Requests
- Submit leave requests categorised by **Annual**, **Casual**, or **Medical** leave.
- **Date Range Validation:** Server-side and client-side checks ensuring `startDate <= endDate`.
- View submissions in a tabular layout with contextual status indicators.

### Administrator Operations
- Unified dashboard displaying all submitted requests.
- One-click approval for pending requests.
- Conditional rejection flow requiring a mandatory justification reason.
- Immutable state enforcement preventing edits to finalized (`Approved` / `Rejected`) records.

---

## Database Design & Entity Relationships

The relational model enforces a strict **One-to-Many (1:N)** relationship between `Employee` and `LeaveRequest`.
