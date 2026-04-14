package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InventoryMovementRequest {
    @NotNull(message = "El ID del producto es obligatorio")
    private Long productId;

    @NotNull(message = "El ID de la sucursal es obligatorio")
    private Long branchId;

    @NotBlank(message = "El tipo de movimiento es obligatorio (INGRESO/RETIRO)")
    private String type;

    @NotBlank(message = "El motivo es obligatorio (COMPRA, VENTA, TRASLADO, MERMA)")
    private String reason;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    private BigDecimal quantity;

    @NotNull(message = "El usuario que realiza el movimiento es obligatorio")
    private Long userId;

    private Long referenceId;
    private String referenceType;
}
