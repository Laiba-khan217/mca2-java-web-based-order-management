package com.oms.dto;

import jakarta.validation.constraints.NotBlank;

public class StatusUpdateDTO {
    @NotBlank(message = "Status cannot be blank")
    private String status;

    public StatusUpdateDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
