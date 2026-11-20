package com.oms.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class PurchaseOrderItemCreateDTO {
    @NotNull(message = "Raw material ID is required")
    private Long rawMaterialId;

    @NotNull(message = "Quantity ordered is required")
    @Positive(message = "Quantity ordered must be greater than zero")
    private BigDecimal quantityOrdered;

    private BigDecimal unitPrice;

    public PurchaseOrderItemCreateDTO() {}

    public Long getRawMaterialId() { return rawMaterialId; }
    public void setRawMaterialId(Long rawMaterialId) { this.rawMaterialId = rawMaterialId; }

    public BigDecimal getQuantityOrdered() { return quantityOrdered; }
    public void setQuantityOrdered(BigDecimal quantityOrdered) { this.quantityOrdered = quantityOrdered; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
