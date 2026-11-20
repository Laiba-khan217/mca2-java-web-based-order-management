package com.oms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PurchaseOrderCreateDTO {
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private LocalDate expectedDeliveryDate;
    private String notes;

    @NotEmpty(message = "Purchase order must contain at least one line item")
    @Valid
    private List<PurchaseOrderItemCreateDTO> items = new ArrayList<>();

    public PurchaseOrderCreateDTO() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<PurchaseOrderItemCreateDTO> getItems() { return items; }
    public void setItems(List<PurchaseOrderItemCreateDTO> items) { this.items = items; }
}
