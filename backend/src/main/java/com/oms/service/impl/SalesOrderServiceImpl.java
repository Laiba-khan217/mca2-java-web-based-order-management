package com.oms.service.impl;

import com.oms.dto.*;
import com.oms.entity.*;
import com.oms.exception.BadRequestException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.CustomerRepository;
import com.oms.repository.ProductRepository;
import com.oms.repository.SalesOrderRepository;
import com.oms.repository.UserRepository;
import com.oms.service.SalesOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesOrderServiceImpl implements SalesOrderService {

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SalesOrderDTO> getAllOrders() {
        return salesOrderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SalesOrderDTO getOrderById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", id));
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public SalesOrderDTO createOrder(SalesOrderCreateDTO dto, Long userId) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", dto.getCustomerId()));

        User createdBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SalesOrder order = new SalesOrder();
        order.setCustomer(customer);
        order.setCreatedBy(createdBy);
        order.setOrderDate(LocalDate.now());
        order.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        order.setNotes(dto.getNotes());
        order.setStatus("PENDING");

        // Generate Order Number: SO-YYYY-XXXX
        int year = LocalDate.now().getYear();
        long count = salesOrderRepository.count() + 1;
        order.setOrderNumber(String.format("SO-%d-%04d", year, count));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;

        for (SalesOrderItemCreateDTO itemDTO : dto.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDTO.getProductId()));

            SalesOrderItem item = new SalesOrderItem();
            item.setSalesOrder(order);
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());

            BigDecimal unitPrice = itemDTO.getUnitPrice() != null ? itemDTO.getUnitPrice() : product.getUnitPrice();
            item.setUnitPrice(unitPrice);

            BigDecimal gstRate = itemDTO.getGstRate() != null ? itemDTO.getGstRate() : product.getGstRate();
            item.setGstRate(gstRate);

            BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            BigDecimal lineTax = lineSubtotal.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = lineSubtotal.add(lineTax);

            item.setLineTax(lineTax);
            item.setLineTotal(lineTotal);

            subtotal = subtotal.add(lineSubtotal);
            taxAmount = taxAmount.add(lineTax);

            order.getItems().add(item);
        }

        BigDecimal discount = dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.add(taxAmount).subtract(discount);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            grandTotal = BigDecimal.ZERO;
        }

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setDiscountAmount(discount);
        order.setGrandTotal(grandTotal);

        SalesOrder saved = salesOrderRepository.save(order);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public SalesOrderDTO updateOrderStatus(Long id, String status) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", id));

        String upperStatus = status.toUpperCase();
        List<String> validStatuses = List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(upperStatus)) {
            throw new BadRequestException("Invalid status: " + status + ". Allowed: " + validStatuses);
        }

        order.setStatus(upperStatus);
        SalesOrder updated = salesOrderRepository.save(order);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", id));
        salesOrderRepository.delete(order);
    }

    private SalesOrderDTO mapToDTO(SalesOrder order) {
        SalesOrderDTO dto = new SalesOrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerId(order.getCustomer().getId());
        dto.setCustomerCode(order.getCustomer().getCustomerCode());
        dto.setCustomerName(order.getCustomer().getCompanyName());
        dto.setCreatedByUserId(order.getCreatedBy().getId());
        dto.setCreatedByName(order.getCreatedBy().getFirstName() + " " + (order.getCreatedBy().getLastName() != null ? order.getCreatedBy().getLastName() : ""));
        dto.setOrderDate(order.getOrderDate());
        dto.setExpectedDeliveryDate(order.getExpectedDeliveryDate());
        dto.setStatus(order.getStatus());
        dto.setSubtotal(order.getSubtotal());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setGrandTotal(order.getGrandTotal());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                SalesOrderItemDTO itemDTO = new SalesOrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductId(item.getProduct().getId());
                itemDTO.setProductCode(item.getProduct().getProductCode());
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setUnitPrice(item.getUnitPrice());
                itemDTO.setGstRate(item.getGstRate());
                itemDTO.setLineTax(item.getLineTax());
                itemDTO.setLineTotal(item.getLineTotal());
                return itemDTO;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
