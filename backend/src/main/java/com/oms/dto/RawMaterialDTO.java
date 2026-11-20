package com.oms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RawMaterialDTO {
    private Long id;
    private String materialCode;

    @NotBlank(message = "Material name is required")
    private String name;

    private String category;

    @NotBlank(message = "Unit of measure is required")
    private String uom;

    @NotNull(message = "Standard cost is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Standard cost must be positive")
    private BigDecimal standardCost;

    private BigDecimal currentStock = BigDecimal.ZERO;
    private BigDecimal reorderLevel = new BigDecimal("10.00");
    private Boolean isActive = true;

    public RawMaterialDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public BigDecimal getStandardCost() { return standardCost; }
    public void setStandardCost(BigDecimal standardCost) { this.standardCost = standardCost; }

    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }

    public BigDecimal getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(BigDecimal reorderLevel) { this.reorderLevel = reorderLevel; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
