package co.com.optiplant.inventario.transfer.application.port.in;

public record UpdateQuantityCommand(
        Long productId,
        Integer requestedQuantity
) {}
