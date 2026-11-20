package com.oms.service.impl;

import com.oms.dto.DashboardStatsDTO;
import com.oms.dto.MonthlySalesDTO;
import com.oms.dto.RawMaterialDTO;
import com.oms.dto.SalesOrderDTO;
import com.oms.entity.Invoice;
import com.oms.entity.Payment;
import com.oms.entity.PurchaseOrder;
import com.oms.entity.SalesOrder;
import com.oms.repository.*;
import com.oms.service.DashboardService;
import com.oms.service.RawMaterialService;
import com.oms.service.SalesOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    @Autowired
    private RawMaterialService rawMaterialService;

    @Autowired
    private SalesOrderService salesOrderService;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // 1. Sales Orders
        List<SalesOrder> orders = salesOrderRepository.findAll();
        stats.setTotalSalesOrders(orders.size());
        stats.setTotalSalesRevenue(orders.stream()
                .map(SalesOrder::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setPendingSalesOrders(orders.stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
                .count());

        // 2. Purchase Orders
        List<PurchaseOrder> pos = purchaseOrderRepository.findAll();
        stats.setTotalPurchaseOrders(pos.size());
        stats.setTotalProcurementSpend(pos.stream()
                .map(PurchaseOrder::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        // 3. Invoices & Payments
        List<Invoice> invoices = invoiceRepository.findAll();
        stats.setTotalInvoices(invoices.size());
        stats.setTotalInvoiceAmount(invoices.stream()
                .map(Invoice::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setOutstandingBalanceDue(invoices.stream()
                .map(Invoice::getBalanceDue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        List<Payment> payments = paymentRepository.findAll();
        stats.setTotalCollectedPayments(payments.stream()
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        // 4. Low stock raw materials (current_stock <= reorder_level)
        List<RawMaterialDTO> lowStock = rawMaterialService.getAllRawMaterials().stream()
                .filter(rm -> rm.getCurrentStock() != null && rm.getReorderLevel() != null &&
                        rm.getCurrentStock().compareTo(rm.getReorderLevel()) <= 0)
                .collect(Collectors.toList());
        stats.setLowStockMaterialCount(lowStock.size());
        stats.setLowStockMaterials(lowStock);

        // 5. Recent Orders (Top 5)
        List<SalesOrderDTO> allOrderDTOs = salesOrderService.getAllOrders();
        allOrderDTOs.sort((a, b) -> b.getId().compareTo(a.getId()));
        stats.setRecentOrders(allOrderDTOs.stream().limit(5).collect(Collectors.toList()));

        // 6. Monthly sales trend
        Map<String, MonthlySalesDTO> monthMap = new TreeMap<>();
        DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("MMM yyyy");

        for (SalesOrder o : orders) {
            if (o.getOrderDate() != null) {
                String key = o.getOrderDate().format(keyFmt);
                String label = o.getOrderDate().format(labelFmt);
                MonthlySalesDTO ms = monthMap.computeIfAbsent(key, k -> new MonthlySalesDTO(key, label, BigDecimal.ZERO, 0));
                ms.setRevenue(ms.getRevenue().add(o.getGrandTotal() != null ? o.getGrandTotal() : BigDecimal.ZERO));
                ms.setOrderCount(ms.getOrderCount() + 1);
            }
        }
        stats.setMonthlySales(new ArrayList<>(monthMap.values()));

        return stats;
    }
}
