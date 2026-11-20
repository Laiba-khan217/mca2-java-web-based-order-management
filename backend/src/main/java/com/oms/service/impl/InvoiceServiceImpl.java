package com.oms.service.impl;

import com.oms.dto.InvoiceCreateDTO;
import com.oms.dto.InvoiceDTO;
import com.oms.dto.InvoiceItemDTO;
import com.oms.entity.*;
import com.oms.exception.BadRequestException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.InvoiceRepository;
import com.oms.repository.SalesOrderRepository;
import com.oms.repository.UserRepository;
import com.oms.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
        return mapToDTO(invoice);
    }

    @Override
    @Transactional
    public InvoiceDTO createInvoiceFromOrder(InvoiceCreateDTO dto, Long userId) {
        SalesOrder order = salesOrderRepository.findById(dto.getSalesOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", dto.getSalesOrderId()));

        User createdBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Invoice invoice = new Invoice();
        invoice.setSalesOrder(order);
        invoice.setCreatedBy(createdBy);
        invoice.setInvoiceDate(dto.getInvoiceDate() != null ? dto.getInvoiceDate() : LocalDate.now());
        invoice.setDueDate(dto.getDueDate() != null ? dto.getDueDate() : invoice.getInvoiceDate().plusDays(30));
        invoice.setStatus("ISSUED");

        int year = LocalDate.now().getYear();
        long count = invoiceRepository.count() + 1;
        invoice.setInvoiceNumber(String.format("INV-%d-%04d", year, count));

        Customer customer = order.getCustomer();
        boolean isIntrastate = customer.getState() != null &&
                customer.getState().equalsIgnoreCase("Maharashtra");

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal cgstTotal = BigDecimal.ZERO;
        BigDecimal sgstTotal = BigDecimal.ZERO;
        BigDecimal igstTotal = BigDecimal.ZERO;

        for (SalesOrderItem orderItem : order.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setProduct(orderItem.getProduct());
            item.setQuantity(orderItem.getQuantity());
            item.setUnitPrice(orderItem.getUnitPrice());

            BigDecimal lineSub = orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
            item.setLineSubtotal(lineSub);

            BigDecimal lineTax = lineSub.multiply(new BigDecimal("18")).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            item.setLineTax(lineTax);
            item.setLineTotal(lineSub.add(lineTax));

            subtotal = subtotal.add(lineSub);

            if (isIntrastate) {
                BigDecimal halfTax = lineTax.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
                cgstTotal = cgstTotal.add(halfTax);
                sgstTotal = sgstTotal.add(halfTax);
            } else {
                igstTotal = igstTotal.add(lineTax);
            }

            invoice.getItems().add(item);
        }

        BigDecimal grandTotal = subtotal.add(cgstTotal).add(sgstTotal).add(igstTotal);

        invoice.setSubtotal(subtotal);
        invoice.setCgstAmount(cgstTotal);
        invoice.setSgstAmount(sgstTotal);
        invoice.setIgstAmount(igstTotal);
        invoice.setGrandTotal(grandTotal);
        invoice.setBalanceDue(grandTotal);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public InvoiceDTO updateStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));

        String upper = status.toUpperCase();
        List<String> valid = List.of("ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED");
        if (!valid.contains(upper)) {
            throw new BadRequestException("Invalid status: " + status);
        }

        invoice.setStatus(upper);
        Invoice updated = invoiceRepository.save(invoice);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
        invoiceRepository.delete(invoice);
    }

    private InvoiceDTO mapToDTO(Invoice inv) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(inv.getId());
        dto.setInvoiceNumber(inv.getInvoiceNumber());
        dto.setSalesOrderId(inv.getSalesOrder().getId());
        dto.setSalesOrderNumber(inv.getSalesOrder().getOrderNumber());
        dto.setCustomerId(inv.getSalesOrder().getCustomer().getId());
        dto.setCustomerCode(inv.getSalesOrder().getCustomer().getCustomerCode());
        dto.setCustomerName(inv.getSalesOrder().getCustomer().getCompanyName());
        dto.setCustomerGstin(inv.getSalesOrder().getCustomer().getGstin());
        dto.setCustomerState(inv.getSalesOrder().getCustomer().getState());
        dto.setBillingAddress(inv.getSalesOrder().getCustomer().getBillingAddress() + ", " +
                inv.getSalesOrder().getCustomer().getCity() + ", " +
                inv.getSalesOrder().getCustomer().getState());
        dto.setCreatedByUserId(inv.getCreatedBy().getId());
        dto.setCreatedByName(inv.getCreatedBy().getFirstName() + " " + (inv.getCreatedBy().getLastName() != null ? inv.getCreatedBy().getLastName() : ""));
        dto.setInvoiceDate(inv.getInvoiceDate());
        dto.setDueDate(inv.getDueDate());
        dto.setStatus(inv.getStatus());
        dto.setSubtotal(inv.getSubtotal());
        dto.setCgstAmount(inv.getCgstAmount());
        dto.setSgstAmount(inv.getSgstAmount());
        dto.setIgstAmount(inv.getIgstAmount());
        dto.setGrandTotal(inv.getGrandTotal());
        dto.setBalanceDue(inv.getBalanceDue());
        dto.setCreatedAt(inv.getCreatedAt());

        if (inv.getItems() != null) {
            dto.setItems(inv.getItems().stream().map(it -> {
                InvoiceItemDTO itemDTO = new InvoiceItemDTO();
                itemDTO.setId(it.getId());
                itemDTO.setProductId(it.getProduct().getId());
                itemDTO.setProductCode(it.getProduct().getProductCode());
                itemDTO.setProductName(it.getProduct().getName());
                itemDTO.setQuantity(it.getQuantity());
                itemDTO.setUnitPrice(it.getUnitPrice());
                itemDTO.setLineSubtotal(it.getLineSubtotal());
                itemDTO.setLineTax(it.getLineTax());
                itemDTO.setLineTotal(it.getLineTotal());
                return itemDTO;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
