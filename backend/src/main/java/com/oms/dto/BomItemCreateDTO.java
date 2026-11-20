package com.oms.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class BomItemCreateDTO {
    @NotNull(message = "Raw material ID is required")
    private Long rawMaterialId;

    @NotNull(message = "Quantity required is required")
    @Positive(message = "Quantity required must be positive")
    private BigDecimal quantityRequired;

    private BigDecimal scrapPercentage = BigDecimal.ZERO;
    private String uom;

    public BomItemCreateDTO() {}

    public Long getRawMaterialId() { return rawMaterialId; }
    public void setRawMaterialId(Long rawMaterialId) { this.rawMaterialId = rawMaterialId; }

    public BigDecimal getQuantityRequired() { return quantityRequired; }
    public void setQuantityRequired(BigDecimal quantityRequired) { this.quantityRequired = quantityRequired; }

    public BigDecimal getScrapPercentage() { return scrapPercentage; }
    public void setScrapPercentage(BigDecimal scrapPercentage) { this.scrapPercentage = scrapPercentage; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }
}
