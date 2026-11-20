package com.oms.controller;

import com.oms.dto.ApiResponse;
import com.oms.dto.RawMaterialDTO;
import com.oms.service.RawMaterialService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/raw-materials")
public class RawMaterialController {

    @Autowired
    private RawMaterialService rawMaterialService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RawMaterialDTO>>> getAllRawMaterials() {
        return ResponseEntity.ok(ApiResponse.success(rawMaterialService.getAllRawMaterials()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RawMaterialDTO>> getRawMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(rawMaterialService.getRawMaterialById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApiResponse<RawMaterialDTO>> createRawMaterial(@Valid @RequestBody RawMaterialDTO dto) {
        RawMaterialDTO created = rawMaterialService.createRawMaterial(dto);
        return new ResponseEntity<>(ApiResponse.success("Raw material created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApiResponse<RawMaterialDTO>> updateRawMaterial(@PathVariable Long id, @Valid @RequestBody RawMaterialDTO dto) {
        RawMaterialDTO updated = rawMaterialService.updateRawMaterial(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Raw material updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteRawMaterial(@PathVariable Long id) {
        rawMaterialService.deleteRawMaterial(id);
        return ResponseEntity.ok(ApiResponse.success("Raw material deactivated successfully", null));
    }
}
