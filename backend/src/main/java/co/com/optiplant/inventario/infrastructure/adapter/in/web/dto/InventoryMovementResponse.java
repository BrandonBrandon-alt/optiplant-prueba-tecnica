package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMovementResponse {

    private Long id;
    private String tipo;         // INGRESO / RETIRO
    private String motivo;       // VENTA, COMPRA, TRASLADO, AJUSTE, etc.
    private BigDecimal cantidad;
    private LocalDateTime fecha;
    private Long productoId;
    private String productoNombre;
    private Long sucursalId;
    private String sucursalNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private Long referenciaId;
    private String tipoReferencia;
}
