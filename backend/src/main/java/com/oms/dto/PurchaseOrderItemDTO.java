package com.oms.dto;

import java.math.BigDecimal;

public class PurchaseOrderItemDTO {
    private Long id;
    private Long rawMaterialId;
    private String materialCode;
    private String materialName;
    private String uom;
    private BigDecimal quantityOrdered;
    private BigDecimal quantityReceived;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;

    public PurchaseOrderItemDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRawMaterialId() { return rawMaterialId; }
    public void setRawMaterialId(Long rawMaterialId) { this.rawMaterialId = rawMaterialId; }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }

    public String getMaterialName() { return materialName; }
    public void setMaterialName(String materialName) { this.materialName = materialName; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }

    public BigDecimal getQuantityOrdered() { return quantityOrdered; }
    public void setQuantityOrdered(BigDecimal quantityOrdered) { this.quantityOrdered = quantityOrdered; }

    public BigDecimal getQuantityReceived() { return quantityReceived; }
    public void setQuantityReceived(BigDecimal quantityReceived) { this.quantityReceived = quantityReceived; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
}
