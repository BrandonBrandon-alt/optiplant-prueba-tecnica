package co.com.zenvory.inventario.catalog.domain.model;

import lombok.Builder;
import java.math.BigDecimal;

/**
 * Representa los detalles comerciales de la relación entre un producto y un proveedor.
 */
@Builder
public record ProductSupplierDetail(
    Long supplierId,
    BigDecimal negotiatedPrice,
    Integer deliveryDays,
    Boolean preferred
) {}
