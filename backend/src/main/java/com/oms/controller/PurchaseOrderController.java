package com.oms.controller;

import com.oms.dto.*;
import com.oms.security.UserPrincipal;
import com.oms.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrderDTO>>> getAllPurchaseOrders() {
        return ResponseEntity.ok(ApiResponse.success("Purchase orders fetched successfully", purchaseOrderService.getAllPurchaseOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order details fetched", purchaseOrderService.getPurchaseOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderCreateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        PurchaseOrderDTO created = purchaseOrderService.createPurchaseOrder(dto, userId);
        return new ResponseEntity<>(ApiResponse.success("Purchase order created successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusDTO) {
        PurchaseOrderDTO updated = purchaseOrderService.updateStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Purchase order status updated to " + statusDTO.getStatus(), updated));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> receiveGoods(
            @PathVariable Long id,
            @Valid @RequestBody GoodsReceiptDTO receiptDTO) {
        PurchaseOrderDTO updated = purchaseOrderService.receiveGoods(id, receiptDTO);
        return ResponseEntity.ok(ApiResponse.success("Goods received and inventory replenished successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order deleted successfully", null));
    }
}
