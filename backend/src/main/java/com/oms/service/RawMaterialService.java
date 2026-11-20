package com.oms.service;

import com.oms.dto.RawMaterialDTO;
import java.util.List;

public interface RawMaterialService {
    List<RawMaterialDTO> getAllRawMaterials();
    RawMaterialDTO getRawMaterialById(Long id);
    RawMaterialDTO createRawMaterial(RawMaterialDTO dto);
    RawMaterialDTO updateRawMaterial(Long id, RawMaterialDTO dto);
    void deleteRawMaterial(Long id);
}
