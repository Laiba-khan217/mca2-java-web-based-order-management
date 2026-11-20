package com.oms.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BomDTO {
    private Long id;
    private String bomNumber;
    private Long productId;
    private String productCode;
    private String productName;
    private String version;
    private Boolean isActive;
    private String notes;
    private LocalDateTime createdAt;
    private List<BomItemDTO> items = new ArrayList<>();

    public BomDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBomNumber() { return bomNumber; }
    public void setBomNumber(String bomNumber) { this.bomNumber = bomNumber; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<BomItemDTO> getItems() { return items; }
    public void setItems(List<BomItemDTO> items) { this.items = items; }
}
