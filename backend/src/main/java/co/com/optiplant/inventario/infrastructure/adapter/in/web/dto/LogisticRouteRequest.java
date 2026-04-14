package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticRouteRequest {

    @NotNull(message = "La sucursal origen es obligatoria")
    private Long sucursalOrigenId;

    @NotNull(message = "La sucursal destino es obligatoria")
    private Long sucursalDestinoId;

    @Min(value = 0, message = "El tiempo estimado no puede ser negativo")
    private Integer tiempoEstimadoHoras;

    private BigDecimal costoFleteEstimado;
}
