package co.com.optiplant.inventario.sale.application.port.in;

import java.util.List;

public record CreateSaleCommand(
        Long branchId,
        Long userId,
        String customerName,
        String customerDocument,
        java.math.BigDecimal globalDiscountPercentage,
        List<Detail> items
) {
    public record Detail(
            Long productId,
            Integer quantity,
            java.math.BigDecimal discountPercentage
    ) {}
}
