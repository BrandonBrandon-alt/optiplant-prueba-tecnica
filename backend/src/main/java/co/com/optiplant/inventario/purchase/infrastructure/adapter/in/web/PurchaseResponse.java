package co.com.optiplant.inventario.purchase.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseResponse(
        Long id,
        String status,
        LocalDateTime requestDate,
        LocalDateTime estimatedArrivalDate,
        Long supplierId,
        Long userId,
        Long branchId,
        BigDecimal totalAmount,
        List<PurchaseDetailResponse> details
) {
    public record PurchaseDetailResponse(
            Long id,
            Long productId,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {}

    public static PurchaseResponse fromDomain(PurchaseOrder order) {
        BigDecimal total = order.getDetails().stream()
                .map(d -> d.getUnitPrice().multiply(d.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PurchaseResponse(
                order.getId(),
                order.getStatus().name(),
                order.getRequestDate(),
                order.getEstimatedArrivalDate(),
                order.getSupplierId(),
                order.getUserId(),
                order.getBranchId(),
                total,
                order.getDetails().stream().map(d -> new PurchaseDetailResponse(
                        d.getId(),
                        d.getProductId(),
                        d.getQuantity(),
                        d.getUnitPrice(),
                        d.getQuantity().multiply(d.getUnitPrice())
                )).toList()
        );
    }
}
