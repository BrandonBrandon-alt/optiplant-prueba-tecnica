package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogisticRoute {
    private Long id;
    private Long sucursalOrigenId;
    private Long sucursalDestinoId;
    private Integer tiempoEstimadoHoras;
    private BigDecimal costoFleteEstimado;

    /**
     * Valida que la ruta no sea circular (origen igual a destino)
     */
    public boolean isValidRoute() {
        return sucursalOrigenId != null &&
                sucursalDestinoId != null &&
                !sucursalOrigenId.equals(sucursalDestinoId);
    }
}