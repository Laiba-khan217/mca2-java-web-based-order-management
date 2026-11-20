package com.oms.service.impl;

import com.oms.dto.*;
import com.oms.entity.*;
import com.oms.exception.BadRequestException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.PurchaseOrderRepository;
import com.oms.repository.RawMaterialRepository;
import com.oms.repository.SupplierRepository;
import com.oms.repository.UserRepository;
import com.oms.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderDTO getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "id", id));
        return mapToDTO(po);
    }

    @Override
    @Transactional
    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderCreateDTO dto, Long userId) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", dto.getSupplierId()));

        User createdBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setCreatedBy(createdBy);
        po.setPoDate(LocalDate.now());
        po.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        po.setNotes(dto.getNotes());
        po.setStatus("ISSUED");

        int year = LocalDate.now().getYear();
        long count = purchaseOrderRepository.count() + 1;
        po.setPoNumber(String.format("PO-%d-%04d", year, count));

        BigDecimal subtotal = BigDecimal.ZERO;

        for (PurchaseOrderItemCreateDTO itemDTO : dto.getItems()) {
            RawMaterial material = rawMaterialRepository.findById(itemDTO.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", itemDTO.getRawMaterialId()));

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setRawMaterial(material);
            item.setQuantityOrdered(itemDTO.getQuantityOrdered());
            item.setQuantityReceived(BigDecimal.ZERO);

            BigDecimal unitPrice = itemDTO.getUnitPrice() != null ? itemDTO.getUnitPrice() : material.getStandardCost();
            item.setUnitPrice(unitPrice);

            BigDecimal lineTotal = unitPrice.multiply(itemDTO.getQuantityOrdered()).setScale(2, RoundingMode.HALF_UP);
            item.setLineTotal(lineTotal);

            subtotal = subtotal.add(lineTotal);
            po.getItems().add(item);
        }

        // 18% GST tax
        BigDecimal taxAmount = subtotal.multiply(new BigDecimal("18")).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(taxAmount);

        po.setSubtotal(subtotal);
        po.setTaxAmount(taxAmount);
        po.setGrandTotal(grandTotal);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderDTO updateStatus(Long id, String status) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "id", id));

        String upperStatus = status.toUpperCase();
        List<String> validStatuses = List.of("DRAFT", "ISSUED", "CONFIRMED", "SHIPPED", "RECEIVED", "CANCELLED");
        if (!validStatuses.contains(upperStatus)) {
            throw new BadRequestException("Invalid status: " + status + ". Allowed: " + validStatuses);
        }

        po.setStatus(upperStatus);
        PurchaseOrder updated = purchaseOrderRepository.save(po);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public PurchaseOrderDTO receiveGoods(Long id, GoodsReceiptDTO receiptDTO) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "id", id));

        Map<Long, PurchaseOrderItem> itemMap = po.getItems().stream()
                .collect(Collectors.toMap(PurchaseOrderItem::getId, item -> item));

        boolean allItemsFulfilled = true;

        for (GoodsReceiptItemDTO receiptItem : receiptDTO.getItems()) {
            PurchaseOrderItem poItem = itemMap.get(receiptItem.getItemId());
            if (poItem == null) {
                throw new BadRequestException("Item ID " + receiptItem.getItemId() + " does not belong to PO " + po.getPoNumber());
            }

            BigDecimal receivedNow = receiptItem.getQuantityReceivedNow();
            if (receivedNow != null && receivedNow.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal priorReceived = poItem.getQuantityReceived() != null ? poItem.getQuantityReceived() : BigDecimal.ZERO;
                BigDecimal newTotalReceived = priorReceived.add(receivedNow);
                poItem.setQuantityReceived(newTotalReceived);

                // Inventory Replenishment: Add to current_stock
                RawMaterial material = poItem.getRawMaterial();
                BigDecimal currentStock = material.getCurrentStock() != null ? material.getCurrentStock() : BigDecimal.ZERO;
                material.setCurrentStock(currentStock.add(receivedNow));
                rawMaterialRepository.save(material);
            }

            if (poItem.getQuantityReceived().compareTo(poItem.getQuantityOrdered()) < 0) {
                allItemsFulfilled = false;
            }
        }

        if (allItemsFulfilled) {
            po.setStatus("RECEIVED");
        } else {
            po.setStatus("SHIPPED"); // or partial receipt in transit
        }

        PurchaseOrder updated = purchaseOrderRepository.save(po);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deletePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "id", id));
        purchaseOrderRepository.delete(po);
    }

    private PurchaseOrderDTO mapToDTO(PurchaseOrder po) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierCode(po.getSupplier().getSupplierCode());
        dto.setSupplierName(po.getSupplier().getCompanyName());
        dto.setCreatedByUserId(po.getCreatedBy().getId());
        dto.setCreatedByName(po.getCreatedBy().getFirstName() + " " + (po.getCreatedBy().getLastName() != null ? po.getCreatedBy().getLastName() : ""));
        dto.setPoDate(po.getPoDate());
        dto.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        dto.setStatus(po.getStatus());
        dto.setSubtotal(po.getSubtotal());
        dto.setTaxAmount(po.getTaxAmount());
        dto.setGrandTotal(po.getGrandTotal());
        dto.setNotes(po.getNotes());
        dto.setCreatedAt(po.getCreatedAt());

        if (po.getItems() != null) {
            dto.setItems(po.getItems().stream().map(item -> {
                PurchaseOrderItemDTO itemDTO = new PurchaseOrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setRawMaterialId(item.getRawMaterial().getId());
                itemDTO.setMaterialCode(item.getRawMaterial().getMaterialCode());
                itemDTO.setMaterialName(item.getRawMaterial().getName());
                itemDTO.setUom(item.getRawMaterial().getUom());
                itemDTO.setQuantityOrdered(item.getQuantityOrdered());
                itemDTO.setQuantityReceived(item.getQuantityReceived());
                itemDTO.setUnitPrice(item.getUnitPrice());
                itemDTO.setLineTotal(item.getLineTotal());
                return itemDTO;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
