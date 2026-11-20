package com.oms.controller;

import com.oms.dto.ApiResponse;
import com.oms.dto.SalesOrderCreateDTO;
import com.oms.dto.SalesOrderDTO;
import com.oms.dto.StatusUpdateDTO;
import com.oms.security.UserPrincipal;
import com.oms.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales-orders")
public class SalesOrderController {

    @Autowired
    private SalesOrderService salesOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesOrderDTO>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("Sales orders fetched successfully", salesOrderService.getAllOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderDTO>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sales order details fetched", salesOrderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalesOrderDTO>> createOrder(
            @Valid @RequestBody SalesOrderCreateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        SalesOrderDTO created = salesOrderService.createOrder(dto, userId);
        return new ResponseEntity<>(ApiResponse.success("Sales order created successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SalesOrderDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusDTO) {
        SalesOrderDTO updated = salesOrderService.updateOrderStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + statusDTO.getStatus(), updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        salesOrderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Sales order deleted successfully", null));
    }
}
