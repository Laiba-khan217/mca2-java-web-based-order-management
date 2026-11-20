package com.oms.service.impl;

import com.oms.dto.RawMaterialDTO;
import com.oms.entity.RawMaterial;
import com.oms.exception.DuplicateResourceException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.RawMaterialRepository;
import com.oms.service.RawMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RawMaterialServiceImpl implements RawMaterialService {

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    private RawMaterialDTO mapToDTO(RawMaterial material) {
        RawMaterialDTO dto = new RawMaterialDTO();
        dto.setId(material.getId());
        dto.setMaterialCode(material.getMaterialCode());
        dto.setName(material.getName());
        dto.setCategory(material.getCategory());
        dto.setUom(material.getUom());
        dto.setStandardCost(material.getStandardCost());
        dto.setCurrentStock(material.getCurrentStock());
        dto.setReorderLevel(material.getReorderLevel());
        dto.setIsActive(material.getIsActive());
        return dto;
    }

    private RawMaterial mapToEntity(RawMaterialDTO dto) {
        RawMaterial material = new RawMaterial();
        material.setMaterialCode(dto.getMaterialCode());
        material.setName(dto.getName());
        material.setCategory(dto.getCategory());
        material.setUom(dto.getUom());
        material.setStandardCost(dto.getStandardCost());
        if (dto.getCurrentStock() != null) material.setCurrentStock(dto.getCurrentStock());
        if (dto.getReorderLevel() != null) material.setReorderLevel(dto.getReorderLevel());
        material.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return material;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RawMaterialDTO> getAllRawMaterials() {
        return rawMaterialRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RawMaterialDTO getRawMaterialById(Long id) {
        RawMaterial material = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", id));
        return mapToDTO(material);
    }

    @Override
    @Transactional
    public RawMaterialDTO createRawMaterial(RawMaterialDTO dto) {
        if (dto.getMaterialCode() == null || dto.getMaterialCode().isBlank()) {
            dto.setMaterialCode("MAT-" + (200 + rawMaterialRepository.count() + 1));
        } else if (rawMaterialRepository.existsByMaterialCode(dto.getMaterialCode())) {
            throw new DuplicateResourceException("Material code '" + dto.getMaterialCode() + "' already exists.");
        }

        RawMaterial material = mapToEntity(dto);
        RawMaterial saved = rawMaterialRepository.save(material);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public RawMaterialDTO updateRawMaterial(Long id, RawMaterialDTO dto) {
        RawMaterial material = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", id));

        material.setName(dto.getName());
        material.setCategory(dto.getCategory());
        material.setUom(dto.getUom());
        material.setStandardCost(dto.getStandardCost());
        if (dto.getCurrentStock() != null) material.setCurrentStock(dto.getCurrentStock());
        if (dto.getReorderLevel() != null) material.setReorderLevel(dto.getReorderLevel());
        if (dto.getIsActive() != null) material.setIsActive(dto.getIsActive());

        RawMaterial updated = rawMaterialRepository.save(material);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteRawMaterial(Long id) {
        RawMaterial material = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RawMaterial", "id", id));
        material.setIsActive(false);
        rawMaterialRepository.save(material);
    }
}
