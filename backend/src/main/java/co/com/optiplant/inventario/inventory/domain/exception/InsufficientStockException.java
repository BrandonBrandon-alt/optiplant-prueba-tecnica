package co.com.optiplant.inventario.inventory.domain.exception;

import java.math.BigDecimal;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(Long branchId, Long productId, BigDecimal requested, BigDecimal available) {
        super(String.format("Stock insuficiente en la sucursal %d para el producto %d. Solicitado: %s, Disponible: %s",
                branchId, productId, requested.toString(), available.toString()));
    }
}
