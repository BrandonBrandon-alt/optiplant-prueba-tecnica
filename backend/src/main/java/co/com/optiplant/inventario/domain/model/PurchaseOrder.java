package co.com.optiplant.inventario.domain.model;

import co.com.optiplant.inventario.domain.enums.PurchaseOrderState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {
    private Long id;
    private PurchaseOrderState estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaEstimadaLlegada;
    private Long proveedorId;
    private Long usuarioId;
}