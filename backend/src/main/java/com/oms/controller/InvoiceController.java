package com.oms.controller;

import com.oms.dto.ApiResponse;
import com.oms.dto.InvoiceCreateDTO;
import com.oms.dto.InvoiceDTO;
import com.oms.dto.StatusUpdateDTO;
import com.oms.security.UserPrincipal;
import com.oms.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceDTO>>> getAllInvoices() {
        return ResponseEntity.ok(ApiResponse.success("Invoices fetched successfully", invoiceService.getAllInvoices()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceDTO>> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Invoice fetched successfully", invoiceService.getInvoiceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceDTO>> createInvoice(
            @Valid @RequestBody InvoiceCreateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        InvoiceDTO created = invoiceService.createInvoiceFromOrder(dto, userId);
        return new ResponseEntity<>(ApiResponse.success("Tax Invoice generated successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<InvoiceDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusDTO) {
        InvoiceDTO updated = invoiceService.updateStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Invoice status updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted successfully", null));
    }
}
