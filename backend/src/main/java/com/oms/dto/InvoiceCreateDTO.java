package com.oms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class InvoiceCreateDTO {
    @NotNull(message = "Sales Order ID is required")
    private Long salesOrderId;

    private LocalDate invoiceDate;
    private LocalDate dueDate;

    public InvoiceCreateDTO() {}

    public Long getSalesOrderId() { return salesOrderId; }
    public void setSalesOrderId(Long salesOrderId) { this.salesOrderId = salesOrderId; }

    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
