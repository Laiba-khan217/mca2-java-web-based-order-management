package com.oms.repository;

import com.oms.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    Optional<RawMaterial> findByMaterialCode(String materialCode);
    Boolean existsByMaterialCode(String materialCode);
}
