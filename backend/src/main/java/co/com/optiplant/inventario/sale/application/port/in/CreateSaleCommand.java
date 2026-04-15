package co.com.optiplant.inventario.sale.application.port.in;

import java.util.List;

public record CreateSaleCommand(
        Long branchId,
        Long userId,
        List<Detail> items
) {
    public record Detail(
            Long productId,
            Integer quantity
    ) {}
}
