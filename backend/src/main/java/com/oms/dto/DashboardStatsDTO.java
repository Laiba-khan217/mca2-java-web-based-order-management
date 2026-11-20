package com.oms.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DashboardStatsDTO {
    private long totalSalesOrders;
    private BigDecimal totalSalesRevenue = BigDecimal.ZERO;
    private long pendingSalesOrders;
    private long totalPurchaseOrders;
    private BigDecimal totalProcurementSpend = BigDecimal.ZERO;
    private long totalInvoices;
    private BigDecimal totalInvoiceAmount = BigDecimal.ZERO;
    private BigDecimal totalCollectedPayments = BigDecimal.ZERO;
    private BigDecimal outstandingBalanceDue = BigDecimal.ZERO;
    private long lowStockMaterialCount = 0;
    private List<RawMaterialDTO> lowStockMaterials = new ArrayList<>();
    private List<MonthlySalesDTO> monthlySales = new ArrayList<>();
    private List<SalesOrderDTO> recentOrders = new ArrayList<>();

    public DashboardStatsDTO() {}

    public long getTotalSalesOrders() { return totalSalesOrders; }
    public void setTotalSalesOrders(long totalSalesOrders) { this.totalSalesOrders = totalSalesOrders; }

    public BigDecimal getTotalSalesRevenue() { return totalSalesRevenue; }
    public void setTotalSalesRevenue(BigDecimal totalSalesRevenue) { this.totalSalesRevenue = totalSalesRevenue; }

    public long getPendingSalesOrders() { return pendingSalesOrders; }
    public void setPendingSalesOrders(long pendingSalesOrders) { this.pendingSalesOrders = pendingSalesOrders; }

    public long getTotalPurchaseOrders() { return totalPurchaseOrders; }
    public void setTotalPurchaseOrders(long totalPurchaseOrders) { this.totalPurchaseOrders = totalPurchaseOrders; }

    public BigDecimal getTotalProcurementSpend() { return totalProcurementSpend; }
    public void setTotalProcurementSpend(BigDecimal totalProcurementSpend) { this.totalProcurementSpend = totalProcurementSpend; }

    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }

    public BigDecimal getTotalInvoiceAmount() { return totalInvoiceAmount; }
    public void setTotalInvoiceAmount(BigDecimal totalInvoiceAmount) { this.totalInvoiceAmount = totalInvoiceAmount; }

    public BigDecimal getTotalCollectedPayments() { return totalCollectedPayments; }
    public void setTotalCollectedPayments(BigDecimal totalCollectedPayments) { this.totalCollectedPayments = totalCollectedPayments; }

    public BigDecimal getOutstandingBalanceDue() { return outstandingBalanceDue; }
    public void setOutstandingBalanceDue(BigDecimal outstandingBalanceDue) { this.outstandingBalanceDue = outstandingBalanceDue; }

    public long getLowStockMaterialCount() { return lowStockMaterialCount; }
    public void setLowStockMaterialCount(long lowStockMaterialCount) { this.lowStockMaterialCount = lowStockMaterialCount; }

    public List<RawMaterialDTO> getLowStockMaterials() { return lowStockMaterials; }
    public void setLowStockMaterials(List<RawMaterialDTO> lowStockMaterials) { this.lowStockMaterials = lowStockMaterials; }

    public List<MonthlySalesDTO> getMonthlySales() { return monthlySales; }
    public void setMonthlySales(List<MonthlySalesDTO> monthlySales) { this.monthlySales = monthlySales; }

    public List<SalesOrderDTO> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<SalesOrderDTO> recentOrders) { this.recentOrders = recentOrders; }
}
