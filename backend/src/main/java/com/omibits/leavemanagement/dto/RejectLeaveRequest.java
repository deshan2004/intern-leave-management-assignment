package com.omibits.leavemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectLeaveRequest {

    @NotBlank(message = "Rejection reason is mandatory when rejecting a leave request")
    @Size(min = 3, max = 500, message = "Rejection reason must be between 3 and 500 characters")
    private String rejectionReason;

    public RejectLeaveRequest() {
    }

    public RejectLeaveRequest(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}

