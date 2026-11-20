package com.oms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class BomCreateDTO {
    @NotNull(message = "Product ID is required")
    private Long productId;

    private String version = "1.0";
    private Boolean isActive = true;
    private String notes;

    @NotEmpty(message = "BOM must contain at least one raw material component")
    @Valid
    private List<BomItemCreateDTO> items = new ArrayList<>();

    public BomCreateDTO() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<BomItemCreateDTO> getItems() { return items; }
    public void setItems(List<BomItemCreateDTO> items) { this.items = items; }
}
