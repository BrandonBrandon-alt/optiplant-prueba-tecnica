package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.ProductUnitRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.ProductUnitResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductUnitEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.UnitOfMeasureEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.ProductRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.ProductUnitRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.UnitOfMeasureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductUnitUseCase {

    private final ProductUnitRepository productUnitRepository;
    private final ProductRepository productRepository;
    private final UnitOfMeasureRepository unitRepository;

    public ProductUnitUseCase(ProductUnitRepository productUnitRepository,
                              ProductRepository productRepository,
                              UnitOfMeasureRepository unitRepository) {
        this.productUnitRepository = productUnitRepository;
        this.productRepository = productRepository;
        this.unitRepository = unitRepository;
    }

    /** Lista todas las presentaciones (unidades) de un producto específico. */
    @Transactional(readOnly = true)
    public List<ProductUnitResponse> getByProductId(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Producto", "ID", productId);
        }
        return productUnitRepository.findByProductoId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Asigna una unidad de medida a un producto con su respectivo factor de conversión.
     * Si esBase=true, desmarca automáticamente cualquier unidad base previa del mismo producto.
     */
    @Transactional
    public ProductUnitResponse assignUnit(ProductUnitRequest request) {
        ProductEntity product = productRepository.findById(request.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "ID", request.getProductoId()));

        UnitOfMeasureEntity unit = unitRepository.findById(request.getUnidadId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidad de Medida", "ID", request.getUnidadId()));

        // Si se marca como base, desmarcar la unidad base anterior del mismo producto
        if (request.isEsBase()) {
            productUnitRepository.findByProductoId(product.getId()).stream()
                    .filter(ProductUnitEntity::isEsBase)
                    .forEach(existing -> {
                        existing.setEsBase(false);
                        productUnitRepository.save(existing);
                    });
        }

        ProductUnitEntity entity = ProductUnitEntity.builder()
                .producto(product)
                .unidad(unit)
                .factorConversion(request.getFactorConversion())
                .esBase(request.isEsBase())
                .build();

        return mapToResponse(productUnitRepository.save(entity));
    }

    /**
     * Actualiza factor de conversión y flag esBase de una relación producto-unidad.
     */
    @Transactional
    public ProductUnitResponse update(Long id, ProductUnitRequest request) {
        ProductUnitEntity entity = productUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presentación de Producto", "ID", id));

        // Si se quiere marcar como base, desmarcar la anterior
        if (request.isEsBase() && !entity.isEsBase()) {
            productUnitRepository.findByProductoId(entity.getProducto().getId()).stream()
                    .filter(pu -> pu.isEsBase() && !pu.getId().equals(id))
                    .forEach(existing -> {
                        existing.setEsBase(false);
                        productUnitRepository.save(existing);
                    });
        }

        entity.setFactorConversion(request.getFactorConversion());
        entity.setEsBase(request.isEsBase());

        return mapToResponse(productUnitRepository.save(entity));
    }

    /** Elimina una presentación de producto. */
    @Transactional
    public void delete(Long id) {
        if (!productUnitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Presentación de Producto", "ID", id);
        }
        productUnitRepository.deleteById(id);
    }

    private ProductUnitResponse mapToResponse(ProductUnitEntity entity) {
        return ProductUnitResponse.builder()
                .id(entity.getId())
                .productoId(entity.getProducto().getId())
                .productoNombre(entity.getProducto().getNombre())
                .unidadId(entity.getUnidad().getId())
                .unidadNombre(entity.getUnidad().getNombre())
                .unidadAbreviatura(entity.getUnidad().getAbreviatura())
                .factorConversion(entity.getFactorConversion())
                .esBase(entity.isEsBase())
                .build();
    }
}
