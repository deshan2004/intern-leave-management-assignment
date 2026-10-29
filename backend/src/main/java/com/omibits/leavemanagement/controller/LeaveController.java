package com.omibits.leavemanagement.controller;

import com.omibits.leavemanagement.dto.LeaveApplicationRequest;
import com.omibits.leavemanagement.dto.LeaveApplicationResponse;
import com.omibits.leavemanagement.dto.RejectLeaveRequest;
import com.omibits.leavemanagement.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<LeaveApplicationResponse> submitLeaveRequest(@Valid @RequestBody LeaveApplicationRequest request) {
        LeaveApplicationResponse response = leaveService.submitLeaveRequest(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LeaveApplicationResponse>> getAllLeaveRequests() {
        List<LeaveApplicationResponse> leaves = leaveService.getAllLeaveRequests();
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveApplicationResponse> getLeaveRequestById(@PathVariable Long id) {
        LeaveApplicationResponse leave = leaveService.getLeaveRequestById(id);
        return ResponseEntity.ok(leave);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<LeaveApplicationResponse> approveLeaveRequest(@PathVariable Long id) {
        LeaveApplicationResponse response = leaveService.approveLeaveRequest(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<LeaveApplicationResponse> rejectLeaveRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectLeaveRequest request) {
        LeaveApplicationResponse response = leaveService.rejectLeaveRequest(id, request);
        return ResponseEntity.ok(response);
    }
}

