package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticRouteResponse {

    private Long id;
    private Long sucursalOrigenId;
    private String sucursalOrigenNombre;
    private Long sucursalDestinoId;
    private String sucursalDestinoNombre;
    private Integer tiempoEstimadoHoras;
    private BigDecimal costoFleteEstimado;
}
