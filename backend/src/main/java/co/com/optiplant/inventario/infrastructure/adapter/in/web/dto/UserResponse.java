package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String nombre;
    private String email;
    private Long rolId;
    private String rolNombre;
    private Long sucursalId;
    private String sucursalNombre;
}
