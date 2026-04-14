package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalInventory {
    private Long id;
    private Long branchId;
    private Long productId;
    private BigDecimal currentQuantity;
    private BigDecimal minimumStock;
    private LocalDateTime lastUpdated;
}
