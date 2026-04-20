package co.com.zenvory.inventario.catalog.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * DTO que captura los términos comerciales de un proveedor para un producto.
 */
public record ProductSupplierRequest(
    @NotNull(message = "El ID del proveedor es obligatorio")
    Long supplierId,

    @NotNull(message = "El precio negociado es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio negociado no puede ser negativo")
    BigDecimal negotiatedPrice,

    @NotNull(message = "El tiempo de entrega es obligatorio")
    @Min(value = 0, message = "El tiempo de entrega no puede ser negativo")
    Integer deliveryDays,

    @NotNull(message = "Debe indicar si es el proveedor preferido")
    Boolean preferred
) {}
