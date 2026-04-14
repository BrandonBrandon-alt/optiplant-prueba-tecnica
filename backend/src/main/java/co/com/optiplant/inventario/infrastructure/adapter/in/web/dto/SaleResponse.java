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
public class SaleResponse {

    private Long id;
    private LocalDateTime fecha;
    private BigDecimal total;
    private Long sucursalId;
    private String sucursalNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private List<SaleDetailDto> detalles;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SaleDetailDto {
        private Long id;
        private Long productoId;
        private String productoNombre;
        private Integer cantidad;
        private BigDecimal precioUnitarioAplicado;
        private BigDecimal subtotal;
    }
}
