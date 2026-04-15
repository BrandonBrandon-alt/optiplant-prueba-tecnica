package co.com.optiplant.inventario.sale.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.sale.domain.model.Sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleResponse(
        Long id,
        LocalDateTime date,
        BigDecimal total,
        Long branchId,
        Long userId,
        List<SaleDetailResponse> details
) {
    public record SaleDetailResponse(
            Long id,
            Long productId,
            Integer quantity,
            BigDecimal unitPriceApplied,
            BigDecimal subtotal
    ) {}

    public static SaleResponse fromDomain(Sale sale) {
        return new SaleResponse(
                sale.getId(),
                sale.getDate(),
                sale.getTotal(),
                sale.getBranchId(),
                sale.getUserId(),
                sale.getDetails().stream().map(d -> new SaleDetailResponse(
                        d.getId(),
                        d.getProductId(),
                        d.getQuantity(),
                        d.getUnitPriceApplied(),
                        d.computeSubtotal()
                )).toList()
        );
    }
}
