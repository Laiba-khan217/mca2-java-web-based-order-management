package com.oms.service;

import com.oms.dto.BomExplosionDTO;
import com.oms.dto.MaterialRequirementDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BomServiceTest {

    @Autowired
    private BomService bomService;

    @Test
    @DisplayName("Should explode BOM for product and include scrap allowance")
    void testExplodeForProduct() {
        // Product 1 is Centrifugal Industrial Pump 15HP
        BomExplosionDTO explosion = bomService.explodeForProduct(1L, 10);

        assertNotNull(explosion);
        assertEquals(10, explosion.getOrderQuantity());
        assertTrue(explosion.getTotalMaterialsNeeded() > 0);

        for (MaterialRequirementDTO req : explosion.getRequirements()) {
            assertNotNull(req.getMaterialCode());
            assertTrue(req.getGrossRequired().compareTo(BigDecimal.ZERO) > 0);
            assertTrue(req.getTotalRequired().compareTo(req.getGrossRequired()) >= 0,
                    "Total required must include scrap buffer and be >= gross required");
            assertNotNull(req.getStatus());
            assertTrue(req.getStatus().equals("SUFFICIENT") || req.getStatus().equals("SHORTFALL"));
        }
    }
}
