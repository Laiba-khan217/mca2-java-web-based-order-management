package com.oms.service;

import com.oms.dto.BomCreateDTO;
import com.oms.dto.BomDTO;
import com.oms.dto.BomExplosionDTO;
import java.util.List;

public interface BomService {
    List<BomDTO> getAllBoms();
    BomDTO getBomById(Long id);
    BomDTO getActiveBomByProductId(Long productId);
    BomDTO createBom(BomCreateDTO dto);
    BomDTO updateBom(Long id, BomCreateDTO dto);
    void deleteBom(Long id);
    BomExplosionDTO explodeForSalesOrder(Long salesOrderId);
    BomExplosionDTO explodeForProduct(Long productId, Integer quantity);
}
