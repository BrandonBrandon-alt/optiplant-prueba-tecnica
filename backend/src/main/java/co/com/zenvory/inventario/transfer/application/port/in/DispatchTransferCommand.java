package co.com.zenvory.inventario.transfer.application.port.in;

import java.util.List;

public record DispatchTransferCommand(
        Long userId,
        String carrier,
        java.math.BigDecimal shippingCost,
        String trackingNumber,
        List<DispatchDetail> items
) {
    public record DispatchDetail(
            Long detailId,
            Integer sentQuantity
    ) {}
}
