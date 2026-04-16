package co.com.optiplant.inventario.inventory.infrastructure.adapter.in.web.dto;

import lombok.Builder;
import java.math.BigDecimal;

/**
 * DTO enriquecido que combina información de inventario y catálogo.
 * Diseñado específicamente para alimentar el catálogo de la Terminal POS y el Inventario Principal.
 */
@Builder
public record InventoryProductResponse(
        Long id,
        Long productId,
        String productoNombre,
        String sku,
        BigDecimal stockActual,
        BigDecimal stockMinimo,
        BigDecimal precioVenta
) {}
