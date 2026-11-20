package com.oms.controller;

import com.oms.dto.ApiResponse;
import com.oms.dto.PaymentCreateDTO;
import com.oms.dto.PaymentDTO;
import com.oms.security.UserPrincipal;
import com.oms.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success("Payments fetched successfully", paymentService.getAllPayments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment details fetched", paymentService.getPaymentById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentDTO>> recordPayment(
            @Valid @RequestBody PaymentCreateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        PaymentDTO created = paymentService.recordPayment(dto, userId);
        return new ResponseEntity<>(ApiResponse.success("Payment recorded and balance updated successfully", created), HttpStatus.CREATED);
    }
}
