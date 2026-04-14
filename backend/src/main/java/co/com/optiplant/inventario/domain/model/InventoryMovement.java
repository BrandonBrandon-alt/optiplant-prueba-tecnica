package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovement {
    private Long id;
    private String type; // INGRESO, RETIRO
    private String reason; // VENTA, COMPRA, TRASLADO, MERMA, AJUSTE
    private BigDecimal quantity;
    private LocalDateTime date;
    private Long productId;
    private Long branchId;
    private Long userId;
    private Long referenceId;
    private String referenceType;
}
