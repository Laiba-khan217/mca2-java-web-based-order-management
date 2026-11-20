package com.oms.controller;

import com.oms.dto.ApiResponse;
import com.oms.dto.BomCreateDTO;
import com.oms.dto.BomDTO;
import com.oms.dto.BomExplosionDTO;
import com.oms.service.BomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/boms")
public class BomController {

    @Autowired
    private BomService bomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BomDTO>>> getAllBoms() {
        return ResponseEntity.ok(ApiResponse.success("All Bills of Materials fetched", bomService.getAllBoms()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BomDTO>> getBomById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("BOM details fetched", bomService.getBomById(id)));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<BomDTO>> getActiveBomByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Active BOM for product fetched", bomService.getActiveBomByProductId(productId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BomDTO>> createBom(@Valid @RequestBody BomCreateDTO dto) {
        BomDTO created = bomService.createBom(dto);
        return new ResponseEntity<>(ApiResponse.success("BOM created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BomDTO>> updateBom(@PathVariable Long id, @Valid @RequestBody BomCreateDTO dto) {
        BomDTO updated = bomService.updateBom(id, dto);
        return ResponseEntity.ok(ApiResponse.success("BOM updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBom(@PathVariable Long id) {
        bomService.deleteBom(id);
        return ResponseEntity.ok(ApiResponse.success("BOM deleted successfully", null));
    }

    @GetMapping("/explode/order/{orderId}")
    public ResponseEntity<ApiResponse<BomExplosionDTO>> explodeForSalesOrder(@PathVariable Long orderId) {
        BomExplosionDTO explosion = bomService.explodeForSalesOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("BOM explosion calculated for Sales Order #" + orderId, explosion));
    }

    @GetMapping("/explode/product/{productId}")
    public ResponseEntity<ApiResponse<BomExplosionDTO>> explodeForProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        BomExplosionDTO explosion = bomService.explodeForProduct(productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("BOM explosion calculated for Product #" + productId + " (Quantity: " + quantity + ")", explosion));
    }
}
