package co.com.optiplant.inventario.inventory.domain.model;

import co.com.optiplant.inventario.catalog.domain.model.MeasurementUnit;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

/**
 * Modelo de dominio enriquecido que combina el estado de inventario
 * con los detalles básicos del producto para propósitos de visualización.
 */
@Getter
@Builder
public class LocalInventoryEnriched {
    private Long id;
    private Long productId;
    private String productNombre;
    private String sku;
    private BigDecimal currentQuantity;
    private BigDecimal minimumStock;
    private BigDecimal salePrice;
    private BigDecimal averageCost;
    private MeasurementUnit unit;
    private java.time.LocalDateTime lastUpdated;
}
