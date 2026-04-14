package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class LocalInventoryResponse {
    private Long branchId;
    private Long productId;
    private String productName;
    private BigDecimal currentQuantity;
    private BigDecimal minimumStock;
    private LocalDateTime lastUpdated;
}
