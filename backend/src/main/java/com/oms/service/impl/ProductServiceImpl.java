package com.oms.service.impl;

import com.oms.dto.ProductDTO;
import com.oms.entity.Product;
import com.oms.exception.DuplicateResourceException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.ProductRepository;
import com.oms.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    private ProductDTO mapToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setProductCode(product.getProductCode());
        dto.setName(product.getName());
        dto.setCategory(product.getCategory());
        dto.setDescription(product.getDescription());
        dto.setUnitPrice(product.getUnitPrice());
        dto.setGstRate(product.getGstRate());
        dto.setUom(product.getUom());
        dto.setCurrentStock(product.getCurrentStock());
        dto.setMinimumStockAlert(product.getMinimumStockAlert());
        dto.setIsActive(product.getIsActive());
        return dto;
    }

    private Product mapToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setProductCode(dto.getProductCode());
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setDescription(dto.getDescription());
        product.setUnitPrice(dto.getUnitPrice());
        if (dto.getGstRate() != null) product.setGstRate(dto.getGstRate());
        if (dto.getUom() != null) product.setUom(dto.getUom());
        if (dto.getCurrentStock() != null) product.setCurrentStock(dto.getCurrentStock());
        if (dto.getMinimumStockAlert() != null) product.setMinimumStockAlert(dto.getMinimumStockAlert());
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return product;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        if (dto.getProductCode() == null || dto.getProductCode().isBlank()) {
            dto.setProductCode("PROD-" + (100 + productRepository.count() + 1));
        } else if (productRepository.existsByProductCode(dto.getProductCode())) {
            throw new DuplicateResourceException("Product code '" + dto.getProductCode() + "' already exists.");
        }

        Product product = mapToEntity(dto);
        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setDescription(dto.getDescription());
        product.setUnitPrice(dto.getUnitPrice());
        if (dto.getGstRate() != null) product.setGstRate(dto.getGstRate());
        if (dto.getUom() != null) product.setUom(dto.getUom());
        if (dto.getCurrentStock() != null) product.setCurrentStock(dto.getCurrentStock());
        if (dto.getMinimumStockAlert() != null) product.setMinimumStockAlert(dto.getMinimumStockAlert());
        if (dto.getIsActive() != null) product.setIsActive(dto.getIsActive());

        Product updated = productRepository.save(product);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(false);
        productRepository.save(product);
    }
}
