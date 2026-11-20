package com.oms.service.impl;

import com.oms.dto.*;
import com.oms.entity.*;
import com.oms.exception.BadRequestException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.*;
import com.oms.service.BomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BomServiceImpl implements BomService {

    @Autowired
    private BillOfMaterialsRepository bomRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BomDTO> getAllBoms() {
        return bomRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BomDTO getBomById(Long id) {
        BillOfMaterials bom = bomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOM", "id", id));
        return mapToDTO(bom);
    }

    @Override
    @Transactional(readOnly = true)
    public BomDTO getActiveBomByProductId(Long productId) {
        BillOfMaterials bom = bomRepository.findByProductIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Active BOM for Product", "productId", productId));
        return mapToDTO(bom);
    }

    @Override
    @Transactional
    public BomDTO createBom(BomCreateDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", dto.getProductId()));

        BillOfMaterials bom = new BillOfMaterials();
        bom.setProduct(product);
        bom.setVersion(dto.getVersion() != null ? dto.getVersion() : "1.0");
        bom.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        bom.setNotes(dto.getNotes());

        long count = bomRepository.count() + 1;
        bom.setBomNumber(String.format("BOM-%s-v%s-%03d", product.getProductCode(), bom.getVersion(), count));

        for (BomItemCreateDTO itemDTO : dto.getItems()) {
            RawMaterial material = rawMaterialRepository.findById(itemDTO.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", itemDTO.getRawMaterialId()));

            BomItem item = new BomItem();
            item.setBom(bom);
            item.setRawMaterial(material);
            item.setQuantityRequired(itemDTO.getQuantityRequired());
            item.setScrapPercentage(itemDTO.getScrapPercentage() != null ? itemDTO.getScrapPercentage() : BigDecimal.ZERO);
            item.setUom(itemDTO.getUom() != null ? itemDTO.getUom() : material.getUom());

            bom.getItems().add(item);
        }

        BillOfMaterials saved = bomRepository.save(bom);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public BomDTO updateBom(Long id, BomCreateDTO dto) {
        BillOfMaterials bom = bomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOM", "id", id));

        if (!bom.getProduct().getId().equals(dto.getProductId())) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", dto.getProductId()));
            bom.setProduct(product);
        }

        bom.setVersion(dto.getVersion() != null ? dto.getVersion() : bom.getVersion());
        bom.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : bom.getIsActive());
        bom.setNotes(dto.getNotes());

        bom.getItems().clear();
        for (BomItemCreateDTO itemDTO : dto.getItems()) {
            RawMaterial material = rawMaterialRepository.findById(itemDTO.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", itemDTO.getRawMaterialId()));

            BomItem item = new BomItem();
            item.setBom(bom);
            item.setRawMaterial(material);
            item.setQuantityRequired(itemDTO.getQuantityRequired());
            item.setScrapPercentage(itemDTO.getScrapPercentage() != null ? itemDTO.getScrapPercentage() : BigDecimal.ZERO);
            item.setUom(itemDTO.getUom() != null ? itemDTO.getUom() : material.getUom());

            bom.getItems().add(item);
        }

        BillOfMaterials updated = bomRepository.save(bom);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteBom(Long id) {
        BillOfMaterials bom = bomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOM", "id", id));
        bomRepository.delete(bom);
    }

    @Override
    @Transactional(readOnly = true)
    public BomExplosionDTO explodeForSalesOrder(Long salesOrderId) {
        SalesOrder order = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", salesOrderId));

        BomExplosionDTO explosion = new BomExplosionDTO();
        explosion.setSalesOrderId(order.getId());
        explosion.setOrderNumber(order.getOrderNumber());

        // Map rawMaterialId -> accumulated requirement
        Map<Long, Accumulator> map = new LinkedHashMap<>();

        int totalUnits = 0;
        for (SalesOrderItem orderItem : order.getItems()) {
            totalUnits += orderItem.getQuantity();
            Product product = orderItem.getProduct();
            Optional<BillOfMaterials> bomOpt = bomRepository.findByProductIdAndIsActiveTrue(product.getId());
            if (bomOpt.isEmpty()) {
                // If no active BOM, try finding any BOM
                List<BillOfMaterials> anyBoms = bomRepository.findByProductId(product.getId());
                if (!anyBoms.isEmpty()) {
                    bomOpt = Optional.of(anyBoms.get(0));
                }
            }

            if (bomOpt.isPresent()) {
                BillOfMaterials bom = bomOpt.get();
                for (BomItem bomItem : bom.getItems()) {
                    RawMaterial rm = bomItem.getRawMaterial();
                    Accumulator acc = map.computeIfAbsent(rm.getId(), k -> new Accumulator(rm));
                    
                    BigDecimal gross = bomItem.getQuantityRequired().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
                    BigDecimal scrap = gross.multiply(bomItem.getScrapPercentage()).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                    acc.grossRequired = acc.grossRequired.add(gross);
                    acc.scrapBuffer = acc.scrapBuffer.add(scrap);
                }
            }
        }

        explosion.setOrderQuantity(totalUnits);
        populateExplosionResults(explosion, map);
        return explosion;
    }

    @Override
    @Transactional(readOnly = true)
    public BomExplosionDTO explodeForProduct(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (quantity == null || quantity <= 0) {
            quantity = 1;
        }

        BomExplosionDTO explosion = new BomExplosionDTO();
        explosion.setProductId(product.getId());
        explosion.setProductName(product.getName());
        explosion.setOrderQuantity(quantity);

        BillOfMaterials bom = bomRepository.findByProductIdAndIsActiveTrue(productId)
                .orElseGet(() -> {
                    List<BillOfMaterials> anyBoms = bomRepository.findByProductId(productId);
                    if (anyBoms.isEmpty()) {
                        throw new BadRequestException("No BOM defined for Product: " + product.getName() + " (" + product.getProductCode() + ")");
                    }
                    return anyBoms.get(0);
                });

        Map<Long, Accumulator> map = new LinkedHashMap<>();
        for (BomItem bomItem : bom.getItems()) {
            RawMaterial rm = bomItem.getRawMaterial();
            Accumulator acc = map.computeIfAbsent(rm.getId(), k -> new Accumulator(rm));

            BigDecimal gross = bomItem.getQuantityRequired().multiply(BigDecimal.valueOf(quantity));
            BigDecimal scrap = gross.multiply(bomItem.getScrapPercentage()).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            acc.grossRequired = acc.grossRequired.add(gross);
            acc.scrapBuffer = acc.scrapBuffer.add(scrap);
        }

        populateExplosionResults(explosion, map);
        return explosion;
    }

    private void populateExplosionResults(BomExplosionDTO explosion, Map<Long, Accumulator> map) {
        BigDecimal totalCost = BigDecimal.ZERO;
        int shortfallCount = 0;
        List<MaterialRequirementDTO> list = new ArrayList<>();

        for (Accumulator acc : map.values()) {
            MaterialRequirementDTO req = new MaterialRequirementDTO();
            req.setRawMaterialId(acc.material.getId());
            req.setMaterialCode(acc.material.getMaterialCode());
            req.setMaterialName(acc.material.getName());
            req.setCategory(acc.material.getCategory());
            req.setUom(acc.material.getUom());
            req.setStandardCost(acc.material.getStandardCost());
            req.setCurrentStock(acc.material.getCurrentStock());
            req.setGrossRequired(acc.grossRequired.setScale(2, RoundingMode.HALF_UP));
            req.setScrapBuffer(acc.scrapBuffer.setScale(2, RoundingMode.HALF_UP));

            BigDecimal totalReq = acc.grossRequired.add(acc.scrapBuffer).setScale(2, RoundingMode.HALF_UP);
            req.setTotalRequired(totalReq);

            BigDecimal currentStock = acc.material.getCurrentStock() != null ? acc.material.getCurrentStock() : BigDecimal.ZERO;
            if (currentStock.compareTo(totalReq) >= 0) {
                req.setShortfall(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
                req.setShortfallCost(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
                req.setStatus("SUFFICIENT");
            } else {
                BigDecimal shortfall = totalReq.subtract(currentStock).setScale(2, RoundingMode.HALF_UP);
                BigDecimal cost = shortfall.multiply(acc.material.getStandardCost()).setScale(2, RoundingMode.HALF_UP);
                req.setShortfall(shortfall);
                req.setShortfallCost(cost);
                req.setStatus("SHORTFALL");
                totalCost = totalCost.add(cost);
                shortfallCount++;
            }
            list.add(req);
        }

        explosion.setRequirements(list);
        explosion.setTotalMaterialsNeeded(list.size());
        explosion.setShortfallMaterialsCount(shortfallCount);
        explosion.setTotalShortfallCost(totalCost.setScale(2, RoundingMode.HALF_UP));
    }

    private static class Accumulator {
        RawMaterial material;
        BigDecimal grossRequired = BigDecimal.ZERO;
        BigDecimal scrapBuffer = BigDecimal.ZERO;

        Accumulator(RawMaterial material) {
            this.material = material;
        }
    }

    private BomDTO mapToDTO(BillOfMaterials bom) {
        BomDTO dto = new BomDTO();
        dto.setId(bom.getId());
        dto.setBomNumber(bom.getBomNumber());
        dto.setProductId(bom.getProduct().getId());
        dto.setProductCode(bom.getProduct().getProductCode());
        dto.setProductName(bom.getProduct().getName());
        dto.setVersion(bom.getVersion());
        dto.setIsActive(bom.getIsActive());
        dto.setNotes(bom.getNotes());
        dto.setCreatedAt(bom.getCreatedAt());

        if (bom.getItems() != null) {
            dto.setItems(bom.getItems().stream().map(item -> {
                BomItemDTO itemDTO = new BomItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setRawMaterialId(item.getRawMaterial().getId());
                itemDTO.setRawMaterialCode(item.getRawMaterial().getMaterialCode());
                itemDTO.setRawMaterialName(item.getRawMaterial().getName());
                itemDTO.setCategory(item.getRawMaterial().getCategory());
                itemDTO.setStandardCost(item.getRawMaterial().getStandardCost());
                itemDTO.setQuantityRequired(item.getQuantityRequired());
                itemDTO.setScrapPercentage(item.getScrapPercentage());
                itemDTO.setUom(item.getUom());
                return itemDTO;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
