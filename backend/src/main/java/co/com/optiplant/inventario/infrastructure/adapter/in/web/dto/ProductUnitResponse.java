package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUnitResponse {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private Long unidadId;
    private String unidadNombre;
    private String unidadAbreviatura;
    private BigDecimal factorConversion;
    private boolean esBase;
}
