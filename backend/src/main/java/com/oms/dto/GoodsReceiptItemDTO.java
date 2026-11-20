package com.oms.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class GoodsReceiptItemDTO {
    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Received quantity is required")
    @PositiveOrZero(message = "Received quantity cannot be negative")
    private BigDecimal quantityReceivedNow;

    public GoodsReceiptItemDTO() {}

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public BigDecimal getQuantityReceivedNow() { return quantityReceivedNow; }
    public void setQuantityReceivedNow(BigDecimal quantityReceivedNow) { this.quantityReceivedNow = quantityReceivedNow; }
}
