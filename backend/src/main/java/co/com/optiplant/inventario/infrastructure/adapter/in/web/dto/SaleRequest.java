package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SaleRequest {
    @NotNull(message = "El ID de la sucursal es obligatorio")
    private Long branchId;
    
    @NotNull(message = "El ID del vendedor (usuario) es obligatorio")
    private Long userId;

    @NotEmpty(message = "La venta debe tener al menos un producto")
    private List<SaleItem> items;

    @Data
    @Builder
    public static class SaleItem {
        @NotNull(message = "Product ID es obligatorio")
        private Long productId;
        
        @NotNull(message = "La cantidad es obligatoria")
        private Integer quantity;
        
        @NotNull(message = "El precio unitario es obligatorio")
        private BigDecimal unitPrice;
    }
}
