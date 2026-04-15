package co.com.optiplant.inventario.catalog.application.service;

import co.com.optiplant.inventario.catalog.application.port.in.UnitOfMeasureUseCase;
import co.com.optiplant.inventario.catalog.application.port.out.UnitOfMeasureRepositoryPort;
import co.com.optiplant.inventario.catalog.domain.exception.UnitOfMeasureNotFoundException;
import co.com.optiplant.inventario.catalog.domain.model.ProductUnit;
import co.com.optiplant.inventario.catalog.domain.model.UnitOfMeasure;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio de aplicación para Unidades de Medida.
 * Gestiona tanto el catálogo de unidades como su asignación a productos.
 */
@Service
public class UnitOfMeasureService implements UnitOfMeasureUseCase {

    private final UnitOfMeasureRepositoryPort unitRepositoryPort;

    public UnitOfMeasureService(UnitOfMeasureRepositoryPort unitRepositoryPort) {
        this.unitRepositoryPort = unitRepositoryPort;
    }

    @Override
    public List<UnitOfMeasure> getAllUnits() {
        return unitRepositoryPort.findAll();
    }

    @Override
    public UnitOfMeasure getUnitById(Long id) {
        return unitRepositoryPort.findById(id)
                .orElseThrow(() -> new UnitOfMeasureNotFoundException(id));
    }

    @Override
    public UnitOfMeasure createUnit(UnitOfMeasure unit) {
        return unitRepositoryPort.save(unit);
    }

    @Override
    public List<ProductUnit> getUnitsByProduct(Long productId) {
        return unitRepositoryPort.findProductUnitsByProductId(productId);
    }

    @Override
    public ProductUnit assignUnitToProduct(ProductUnit productUnit) {
        // Verificar que la unidad existe antes de asociarla
        unitRepositoryPort.findById(productUnit.getUnitId())
                .orElseThrow(() -> new UnitOfMeasureNotFoundException(productUnit.getUnitId()));
        return unitRepositoryPort.saveProductUnit(productUnit);
    }
}
