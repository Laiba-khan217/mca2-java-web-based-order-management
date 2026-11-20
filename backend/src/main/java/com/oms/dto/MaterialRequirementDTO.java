package com.oms.dto;

import java.math.BigDecimal;

public class MaterialRequirementDTO {
    private Long rawMaterialId;
    private String materialCode;
    private String materialName;
    private String category;
    private String uom;
    private BigDecimal standardCost;
    private BigDecimal currentStock;
    private BigDecimal grossRequired;
    private BigDecimal scrapBuffer;
    private BigDecimal totalRequired;
    private BigDecimal shortfall;
    private BigDecimal shortfallCost;
    private String status; // SUFFICIENT, SHORTFALL

    public MaterialRequirementDTO() {}

    public Long getRawMaterialId() { return rawMaterialId; }
    public void setRawMaterialId(Long rawMaterialId) { this.rawMaterialId = rawMaterialId; }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }

    public String getMaterialName() { return materialName; }
    public void setMaterialName(String materialName) { this.materialName = materialName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public BigDecimal getStandardCost() { return standardCost; }
    public void setStandardCost(BigDecimal standardCost) { this.standardCost = standardCost; }

    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }

    public BigDecimal getGrossRequired() { return grossRequired; }
    public void setGrossRequired(BigDecimal grossRequired) { this.grossRequired = grossRequired; }

    public BigDecimal getScrapBuffer() { return scrapBuffer; }
    public void setScrapBuffer(BigDecimal scrapBuffer) { this.scrapBuffer = scrapBuffer; }

    public BigDecimal getTotalRequired() { return totalRequired; }
    public void setTotalRequired(BigDecimal totalRequired) { this.totalRequired = totalRequired; }

    public BigDecimal getShortfall() { return shortfall; }
    public void setShortfall(BigDecimal shortfall) { this.shortfall = shortfall; }

    public BigDecimal getShortfallCost() { return shortfallCost; }
    public void setShortfallCost(BigDecimal shortfallCost) { this.shortfallCost = shortfallCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
