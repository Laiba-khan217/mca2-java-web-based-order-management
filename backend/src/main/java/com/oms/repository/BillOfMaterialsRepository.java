package com.oms.repository;

import com.oms.entity.BillOfMaterials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillOfMaterialsRepository extends JpaRepository<BillOfMaterials, Long> {
    Optional<BillOfMaterials> findByBomNumber(String bomNumber);
    Optional<BillOfMaterials> findByProductIdAndIsActiveTrue(Long productId);
    java.util.List<BillOfMaterials> findByProductId(Long productId);
}
