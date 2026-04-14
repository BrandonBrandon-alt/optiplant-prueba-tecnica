package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {

    private Long id;
    private String nombre;
    private String contacto;
    private Integer tiempoEntregaDias;
}
