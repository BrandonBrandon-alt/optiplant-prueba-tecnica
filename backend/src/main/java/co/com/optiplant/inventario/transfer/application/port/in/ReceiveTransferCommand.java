package co.com.optiplant.inventario.transfer.application.port.in;

import java.util.List;

public record ReceiveTransferCommand(
        Long userId,
        List<ReceivedDetail> items
) {
    public record ReceivedDetail(
            Long detailId,
            Integer receivedQuantity
    ) {}
}
