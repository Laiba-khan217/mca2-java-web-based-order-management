package com.oms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class SalesOrderCreateDTO {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private LocalDate expectedDeliveryDate;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private String notes;

    @NotEmpty(message = "Order must have at least one line item")
    @Valid
    private List<SalesOrderItemCreateDTO> items = new ArrayList<>();

    public SalesOrderCreateDTO() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<SalesOrderItemCreateDTO> getItems() { return items; }
    public void setItems(List<SalesOrderItemCreateDTO> items) { this.items = items; }
}
