package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.domain.model.Product;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductUseCase {

    private final ProductRepository productRepository;

    public ProductUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    public Product getProductBySku(String sku) {
        ProductEntity entity = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "SKU", sku));
        return mapToDomain(entity);
    }

    // Mapper simple para Hexagonal
    private Product mapToDomain(ProductEntity entity) {
        return Product.builder()
                .id(entity.getId())
                .sku(entity.getSku())
                .name(entity.getNombre())
                .averageCost(entity.getCostoPromedio())
                .salePrice(entity.getPrecioVenta())
                .supplierId(entity.getProveedor() != null ? entity.getProveedor().getId() : null)
                .build();
    }
}
