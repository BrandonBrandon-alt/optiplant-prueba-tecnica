package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAlert {
    private Long id;
    private Long sucursalId;
    private Long productoId;
    private String mensaje;
    private LocalDateTime fechaAlerta;
    private Boolean resuelta;

    /**
     * Lógica de dominio para marcar como leída/resuelta
     */
    public void marcarComoResuelta() {
        this.resuelta = true;
    }
}