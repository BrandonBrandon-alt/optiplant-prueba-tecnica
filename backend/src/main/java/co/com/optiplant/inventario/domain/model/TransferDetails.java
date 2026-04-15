package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferDetails {
    private Long id;
    private Long transferenciaId;
    private Long productoId;
    private Integer cantidadSolicitada;
    private Integer cantidadEnviada;
    private Integer cantidadRecibida;
    private Integer faltantes;

    /**
     * Lógica de dominio para calcular faltantes automáticamente
     */
    public void calcularFaltantes() {
        this.faltantes = Math.max(0, this.cantidadEnviada - this.cantidadRecibida);
    }
}