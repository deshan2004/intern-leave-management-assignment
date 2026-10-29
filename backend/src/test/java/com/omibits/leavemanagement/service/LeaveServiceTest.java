package com.omibits.leavemanagement.service;

import com.omibits.leavemanagement.dto.LeaveApplicationRequest;
import com.omibits.leavemanagement.dto.LeaveApplicationResponse;
import com.omibits.leavemanagement.dto.RejectLeaveRequest;
import com.omibits.leavemanagement.entity.Employee;
import com.omibits.leavemanagement.entity.LeaveRequest;
import com.omibits.leavemanagement.entity.LeaveStatus;
import com.omibits.leavemanagement.entity.LeaveType;
import com.omibits.leavemanagement.exception.InvalidOperationException;
import com.omibits.leavemanagement.repository.LeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private EmployeeService employeeService;

    @InjectMocks
    private LeaveService leaveService;

    private Employee dummyEmployee;

    @BeforeEach
    void setUp() {
        dummyEmployee = new Employee("Kasun Perera", "kasun@omibits.com", "Engineering");
        dummyEmployee.setId(1L);
    }

    @Test
    @DisplayName("Should submit leave request successfully when date range is valid")
    void shouldSubmitLeaveRequestSuccessfully() {
        LocalDate start = LocalDate.now().plusDays(2);
        LocalDate end = LocalDate.now().plusDays(5);
        LeaveApplicationRequest request = new LeaveApplicationRequest(1L, LeaveType.ANNUAL, start, end, "Vacation");

        when(employeeService.getEmployeeEntityById(1L)).thenReturn(dummyEmployee);

        LeaveRequest saved = new LeaveRequest(dummyEmployee, LeaveType.ANNUAL, start, end, "Vacation");
        saved.setId(10L);
        saved.setCreatedAt(LocalDateTime.now());
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(saved);

        LeaveApplicationResponse response = leaveService.submitLeaveRequest(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(LeaveStatus.PENDING, response.getStatus());
        assertEquals("Kasun Perera", response.getEmployeeName());
        verify(leaveRequestRepository, times(1)).save(any(LeaveRequest.class));
    }

    @Test
    @DisplayName("Should throw InvalidOperationException when end date is before start date")
    void shouldThrowExceptionWhenEndDateBeforeStartDate() {
        LocalDate start = LocalDate.now().plusDays(5);
        LocalDate end = LocalDate.now().plusDays(2); // Invalid: end before start!
        LeaveApplicationRequest request = new LeaveApplicationRequest(1L, LeaveType.ANNUAL, start, end, "Vacation");

        InvalidOperationException ex = assertThrows(InvalidOperationException.class, () ->
                leaveService.submitLeaveRequest(request)
        );

        assertTrue(ex.getMessage().contains("cannot be before start date"));
        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    @DisplayName("Should approve a pending leave request")
    void shouldApprovePendingLeaveRequest() {
        LeaveRequest pendingLeave = new LeaveRequest(dummyEmployee, LeaveType.CASUAL,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(2), "Personal");
        pendingLeave.setId(10L);
        pendingLeave.setStatus(LeaveStatus.PENDING);
        pendingLeave.setCreatedAt(LocalDateTime.now());

        when(leaveRequestRepository.findById(10L)).thenReturn(Optional.of(pendingLeave));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveApplicationResponse response = leaveService.approveLeaveRequest(10L);

        assertNotNull(response);
        assertEquals(LeaveStatus.APPROVED, response.getStatus());
        verify(leaveRequestRepository, times(1)).save(pendingLeave);
    }

    @Test
    @DisplayName("Should throw InvalidOperationException when approving an already approved/rejected request")
    void shouldThrowExceptionWhenApprovingNonPendingRequest() {
        LeaveRequest approvedLeave = new LeaveRequest(dummyEmployee, LeaveType.CASUAL,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(2), "Personal");
        approvedLeave.setId(10L);
        approvedLeave.setStatus(LeaveStatus.APPROVED);

        when(leaveRequestRepository.findById(10L)).thenReturn(Optional.of(approvedLeave));

        InvalidOperationException ex = assertThrows(InvalidOperationException.class, () ->
                leaveService.approveLeaveRequest(10L)
        );

        assertTrue(ex.getMessage().contains("Only PENDING requests can be approved"));
        verify(leaveRequestRepository, never()).save(approvedLeave);
    }

    @Test
    @DisplayName("Should reject a pending leave request with a mandatory rejection reason")
    void shouldRejectPendingLeaveRequest() {
        LeaveRequest pendingLeave = new LeaveRequest(dummyEmployee, LeaveType.MEDICAL,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(2), "Medical issue");
        pendingLeave.setId(15L);
        pendingLeave.setStatus(LeaveStatus.PENDING);
        pendingLeave.setCreatedAt(LocalDateTime.now());

        when(leaveRequestRepository.findById(15L)).thenReturn(Optional.of(pendingLeave));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RejectLeaveRequest rejectRequest = new RejectLeaveRequest("No medical proof attached");
        LeaveApplicationResponse response = leaveService.rejectLeaveRequest(15L, rejectRequest);

        assertNotNull(response);
        assertEquals(LeaveStatus.REJECTED, response.getStatus());
        assertEquals("No medical proof attached", response.getRejectionReason());
        verify(leaveRequestRepository, times(1)).save(pendingLeave);
    }

    @Test
    @DisplayName("Should throw InvalidOperationException when rejecting without a rejection reason")
    void shouldThrowExceptionWhenRejectingWithoutReason() {
        LeaveRequest pendingLeave = new LeaveRequest(dummyEmployee, LeaveType.MEDICAL,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(2), "Medical issue");
        pendingLeave.setId(15L);
        pendingLeave.setStatus(LeaveStatus.PENDING);

        when(leaveRequestRepository.findById(15L)).thenReturn(Optional.of(pendingLeave));

        RejectLeaveRequest invalidReject = new RejectLeaveRequest("   "); // empty / blank

        InvalidOperationException ex = assertThrows(InvalidOperationException.class, () ->
                leaveService.rejectLeaveRequest(15L, invalidReject)
        );

        assertTrue(ex.getMessage().contains("rejection reason must be provided"));
        verify(leaveRequestRepository, never()).save(pendingLeave);
    }
}

