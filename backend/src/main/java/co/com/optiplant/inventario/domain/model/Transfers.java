package co.com.optiplant.inventario.domain.model;

import co.com.optiplant.inventario.domain.enums.TransferState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transfers {
    private Long id;
    private TransferState estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaEstimadaLlegada;
    private LocalDateTime fechaRealLlegada;
    private Long sucursalOrigenId;
    private Long sucursalDestinoId;
}