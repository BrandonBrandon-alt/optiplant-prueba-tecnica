package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlertResponse {

    private Long id;
    private Long sucursalId;
    private String sucursalNombre;
    private Long productoId;
    private String productoNombre;
    private String mensaje;
    private LocalDateTime fechaAlerta;
    private Boolean resuelta;
}
