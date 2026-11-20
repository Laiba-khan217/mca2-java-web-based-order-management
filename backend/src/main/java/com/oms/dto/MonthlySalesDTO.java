package com.oms.dto;

import java.math.BigDecimal;

public class MonthlySalesDTO {
    private String month;
    private String label;
    private BigDecimal revenue = BigDecimal.ZERO;
    private int orderCount = 0;

    public MonthlySalesDTO() {}

    public MonthlySalesDTO(String month, String label, BigDecimal revenue, int orderCount) {
        this.month = month;
        this.label = label;
        this.revenue = revenue;
        this.orderCount = orderCount;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public int getOrderCount() { return orderCount; }
    public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
}
