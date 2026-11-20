package com.oms.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BomExplosionDTO {
    private Long salesOrderId;
    private String orderNumber;
    private Long productId;
    private String productName;
    private Integer orderQuantity;
    private BigDecimal totalShortfallCost = BigDecimal.ZERO;
    private int totalMaterialsNeeded = 0;
    private int shortfallMaterialsCount = 0;
    private List<MaterialRequirementDTO> requirements = new ArrayList<>();

    public BomExplosionDTO() {}

    public Long getSalesOrderId() { return salesOrderId; }
    public void setSalesOrderId(Long salesOrderId) { this.salesOrderId = salesOrderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getOrderQuantity() { return orderQuantity; }
    public void setOrderQuantity(Integer orderQuantity) { this.orderQuantity = orderQuantity; }

    public BigDecimal getTotalShortfallCost() { return totalShortfallCost; }
    public void setTotalShortfallCost(BigDecimal totalShortfallCost) { this.totalShortfallCost = totalShortfallCost; }

    public int getTotalMaterialsNeeded() { return totalMaterialsNeeded; }
    public void setTotalMaterialsNeeded(int totalMaterialsNeeded) { this.totalMaterialsNeeded = totalMaterialsNeeded; }

    public int getShortfallMaterialsCount() { return shortfallMaterialsCount; }
    public void setShortfallMaterialsCount(int shortfallMaterialsCount) { this.shortfallMaterialsCount = shortfallMaterialsCount; }

    public List<MaterialRequirementDTO> getRequirements() { return requirements; }
    public void setRequirements(List<MaterialRequirementDTO> requirements) { this.requirements = requirements; }
}
