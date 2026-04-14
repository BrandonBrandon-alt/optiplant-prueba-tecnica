package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {
    @NotNull(message = "Sucursal Origen obligatoria")
    private Long originBranchId;

    @NotNull(message = "Sucursal Destino obligatoria")
    private Long destinationBranchId;

    private LocalDateTime estimatedArrival;

    @NotEmpty(message = "Al menos un producto debe ser transferido")
    private List<TransferItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferItem {
        @NotNull(message = "Producto obligatorio")
        private Long productId;
        
        @NotNull(message = "Cantidad solicitada obligatoria")
        private Integer quantity;
    }
}
