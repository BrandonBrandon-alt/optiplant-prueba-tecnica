package co.com.optiplant.inventario.infrastructure.adapter.in.web.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseRequest {

    private Long supplierId;
    private Long userId;
    private String estimatedArrival; // ISO date-time string, parsed in UseCase
    private List<PurchaseItem> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PurchaseItem {
        private Long productId;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
    }
}
