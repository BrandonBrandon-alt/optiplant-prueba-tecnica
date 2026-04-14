package co.com.optiplant.inventario.domain.exception;

public class InsufficientStockException extends DomainException {
    public InsufficientStockException(String message) {
        super(message);
    }
}
