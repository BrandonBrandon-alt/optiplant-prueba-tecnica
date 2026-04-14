package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUnitRequest {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    @NotNull(message = "El ID de la unidad de medida es obligatorio")
    private Long unidadId;

    @NotNull(message = "El factor de conversión es obligatorio")
    @DecimalMin(value = "0.0001", message = "El factor de conversión debe ser mayor que cero")
    private BigDecimal factorConversion;

    /** Si es true, esta será la unidad base del producto; el resto se desmarcan automáticamente */
    private boolean esBase;
}
