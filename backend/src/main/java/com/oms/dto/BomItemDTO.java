package com.oms.dto;

import java.math.BigDecimal;

public class BomItemDTO {
    private Long id;
    private Long rawMaterialId;
    private String rawMaterialCode;
    private String rawMaterialName;
    private String category;
    private BigDecimal standardCost;
    private BigDecimal quantityRequired;
    private BigDecimal scrapPercentage;
    private String uom;

    public BomItemDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRawMaterialId() { return rawMaterialId; }
    public void setRawMaterialId(Long rawMaterialId) { this.rawMaterialId = rawMaterialId; }

    public String getRawMaterialCode() { return rawMaterialCode; }
    public void setRawMaterialCode(String rawMaterialCode) { this.rawMaterialCode = rawMaterialCode; }

    public String getRawMaterialName() { return rawMaterialName; }
    public void setRawMaterialName(String rawMaterialName) { this.rawMaterialName = rawMaterialName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getStandardCost() { return standardCost; }
    public void setStandardCost(BigDecimal standardCost) { this.standardCost = standardCost; }

    public BigDecimal getQuantityRequired() { return quantityRequired; }
    public void setQuantityRequired(BigDecimal quantityRequired) { this.quantityRequired = quantityRequired; }

    public BigDecimal getScrapPercentage() { return scrapPercentage; }
    public void setScrapPercentage(BigDecimal scrapPercentage) { this.scrapPercentage = scrapPercentage; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }
}
