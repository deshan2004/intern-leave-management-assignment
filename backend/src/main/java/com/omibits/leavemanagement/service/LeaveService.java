package com.omibits.leavemanagement.service;

import com.omibits.leavemanagement.dto.LeaveApplicationRequest;
import com.omibits.leavemanagement.dto.LeaveApplicationResponse;
import com.omibits.leavemanagement.dto.RejectLeaveRequest;
import com.omibits.leavemanagement.entity.Employee;
import com.omibits.leavemanagement.entity.LeaveRequest;
import com.omibits.leavemanagement.entity.LeaveStatus;
import com.omibits.leavemanagement.exception.InvalidOperationException;
import com.omibits.leavemanagement.exception.ResourceNotFoundException;
import com.omibits.leavemanagement.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeService employeeService;

    public LeaveService(LeaveRequestRepository leaveRequestRepository, EmployeeService employeeService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeService = employeeService;
    }

    public LeaveApplicationResponse submitLeaveRequest(LeaveApplicationRequest request) {
        // Business Rule: Validate Date Range (endDate cannot be before startDate)
        validateDateRange(request.getStartDate(), request.getEndDate());

        // Validate employee existence
        Employee employee = employeeService.getEmployeeEntityById(request.getEmployeeId());

        LeaveRequest leaveRequest = new LeaveRequest(
                employee,
                request.getLeaveType(),
                request.getStartDate(),
                request.getEndDate(),
                request.getReason() != null ? request.getReason().trim() : null
        );

        if (request.getAttachmentName() != null && !request.getAttachmentName().trim().isEmpty()) {
            leaveRequest.setAttachmentName(request.getAttachmentName().trim());
            leaveRequest.setAttachmentType(request.getAttachmentType());
            leaveRequest.setAttachmentData(request.getAttachmentData());
        }

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveApplicationResponse> getAllLeaveRequests() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeaveApplicationResponse getLeaveRequestById(Long id) {
        LeaveRequest leaveRequest = findLeaveById(id);
        return mapToResponse(leaveRequest);
    }

    public LeaveApplicationResponse approveLeaveRequest(Long id) {
        LeaveRequest leaveRequest = findLeaveById(id);

        // Business Rule: State Transition Enforcement
        // Only PENDING requests can be approved
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidOperationException(
                    "Invalid state transition: Cannot approve a leave request with status '" + leaveRequest.getStatus() + "'. Only PENDING requests can be approved."
            );
        }

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(updated);
    }

    public LeaveApplicationResponse rejectLeaveRequest(Long id, RejectLeaveRequest request) {
        LeaveRequest leaveRequest = findLeaveById(id);

        // Business Rule: State Transition Enforcement
        // Only PENDING requests can be rejected
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidOperationException(
                    "Invalid state transition: Cannot reject a leave request with status '" + leaveRequest.getStatus() + "'. Only PENDING requests can be rejected."
            );
        }

        // Business Rule: Mandatory Rejection Reason
        if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
            throw new InvalidOperationException("A non-empty rejection reason must be provided when rejecting a leave request.");
        }

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setRejectionReason(request.getRejectionReason().trim());
        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(updated);
    }

    public LeaveApplicationResponse updateLeaveRequest(Long id, LeaveApplicationRequest request) {
        LeaveRequest leaveRequest = findLeaveById(id);

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidOperationException(
                    "Only PENDING leave requests can be edited. Current status: " + leaveRequest.getStatus()
            );
        }

        validateDateRange(request.getStartDate(), request.getEndDate());

        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setReason(request.getReason() != null ? request.getReason().trim() : null);

        if (request.getAttachmentName() != null) {
            leaveRequest.setAttachmentName(request.getAttachmentName().trim().isEmpty() ? null : request.getAttachmentName().trim());
            leaveRequest.setAttachmentType(request.getAttachmentType());
            leaveRequest.setAttachmentData(request.getAttachmentData());
        }

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(updated);
    }

    public void deleteLeaveRequest(Long id) {
        LeaveRequest leaveRequest = findLeaveById(id);
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidOperationException(
                    "Only PENDING leave requests can be cancelled. Current status: " + leaveRequest.getStatus()
            );
        }
        leaveRequestRepository.delete(leaveRequest);
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new InvalidOperationException("Start date and end date must both be provided.");
        }
        if (endDate.isBefore(startDate)) {
            throw new InvalidOperationException(
                    "Invalid date range: End date (" + endDate + ") cannot be before start date (" + startDate + ")."
            );
        }
    }

    private LeaveRequest findLeaveById(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + id));
    }

    private LeaveApplicationResponse mapToResponse(LeaveRequest leave) {
        LeaveApplicationResponse response = new LeaveApplicationResponse(
                leave.getId(),
                leave.getEmployee().getId(),
                leave.getEmployee().getName(),
                leave.getEmployee().getEmail(),
                leave.getEmployee().getDepartment(),
                leave.getLeaveType(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getReason(),
                leave.getStatus(),
                leave.getRejectionReason(),
                leave.getCreatedAt()
        );
        response.setAttachmentName(leave.getAttachmentName());
        response.setAttachmentType(leave.getAttachmentType());
        response.setAttachmentData(leave.getAttachmentData());
        return response;
    }
}

