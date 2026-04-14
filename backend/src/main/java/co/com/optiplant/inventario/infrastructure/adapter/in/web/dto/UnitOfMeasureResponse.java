package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitOfMeasureResponse {

    private Long id;
    private String nombre;
    private String abreviatura;
}
