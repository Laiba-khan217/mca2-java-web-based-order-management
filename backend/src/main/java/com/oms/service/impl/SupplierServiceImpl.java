package com.oms.service.impl;

import com.oms.dto.SupplierDTO;
import com.oms.entity.Supplier;
import com.oms.exception.DuplicateResourceException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.SupplierRepository;
import com.oms.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierServiceImpl implements SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    private SupplierDTO mapToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setSupplierCode(supplier.getSupplierCode());
        dto.setCompanyName(supplier.getCompanyName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setGstin(supplier.getGstin());
        dto.setAddress(supplier.getAddress());
        dto.setCity(supplier.getCity());
        dto.setState(supplier.getState());
        dto.setPincode(supplier.getPincode());
        dto.setIsActive(supplier.getIsActive());
        return dto;
    }

    private Supplier mapToEntity(SupplierDTO dto) {
        Supplier supplier = new Supplier();
        supplier.setSupplierCode(dto.getSupplierCode());
        supplier.setCompanyName(dto.getCompanyName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setGstin(dto.getGstin());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setState(dto.getState());
        supplier.setPincode(dto.getPincode());
        supplier.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return supplier;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return mapToDTO(supplier);
    }

    @Override
    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        if (dto.getSupplierCode() == null || dto.getSupplierCode().isBlank()) {
            dto.setSupplierCode("SUPP-" + (2000 + supplierRepository.count() + 1));
        } else if (supplierRepository.existsBySupplierCode(dto.getSupplierCode())) {
            throw new DuplicateResourceException("Supplier code '" + dto.getSupplierCode() + "' already exists.");
        }

        Supplier supplier = mapToEntity(dto);
        Supplier saved = supplierRepository.save(supplier);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        supplier.setCompanyName(dto.getCompanyName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setGstin(dto.getGstin());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setState(dto.getState());
        supplier.setPincode(dto.getPincode());
        if (dto.getIsActive() != null) supplier.setIsActive(dto.getIsActive());

        Supplier updated = supplierRepository.save(supplier);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }
}
