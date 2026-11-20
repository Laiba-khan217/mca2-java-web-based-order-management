package com.oms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bom_items")
public class BomItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_id", nullable = false)
    @JsonIgnore
    private BillOfMaterials bom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    @Column(name = "quantity_required", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantityRequired;

    @Column(name = "scrap_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal scrapPercentage = BigDecimal.ZERO;

    @Column(name = "uom", length = 20)
    private String uom;

    public BomItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BillOfMaterials getBom() { return bom; }
    public void setBom(BillOfMaterials bom) { this.bom = bom; }

    public RawMaterial getRawMaterial() { return rawMaterial; }
    public void setRawMaterial(RawMaterial rawMaterial) { this.rawMaterial = rawMaterial; }

    public BigDecimal getQuantityRequired() { return quantityRequired; }
    public void setQuantityRequired(BigDecimal quantityRequired) { this.quantityRequired = quantityRequired; }

    public BigDecimal getScrapPercentage() { return scrapPercentage; }
    public void setScrapPercentage(BigDecimal scrapPercentage) { this.scrapPercentage = scrapPercentage; }

    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }
}
