package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseResponse {

    private Long id;
    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaEstimadaLlegada;
    private Long proveedorId;
    private String proveedorNombre;
    private Long usuarioId;
    private List<PurchaseDetailResponse> detalles;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PurchaseDetailResponse {
        private Long id;
        private Long productoId;
        private String productoNombre;
        private BigDecimal cantidad;
        private BigDecimal precioUnitario;
    }
}
