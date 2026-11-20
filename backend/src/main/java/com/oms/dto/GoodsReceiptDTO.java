package com.oms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

public class GoodsReceiptDTO {
    @NotEmpty(message = "Receipt items cannot be empty")
    @Valid
    private List<GoodsReceiptItemDTO> items = new ArrayList<>();

    public GoodsReceiptDTO() {}

    public List<GoodsReceiptItemDTO> getItems() { return items; }
    public void setItems(List<GoodsReceiptItemDTO> items) { this.items = items; }
}
