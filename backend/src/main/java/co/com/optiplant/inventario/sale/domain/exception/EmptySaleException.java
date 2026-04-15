package co.com.optiplant.inventario.sale.domain.exception;

public class EmptySaleException extends RuntimeException {
    public EmptySaleException(String message) {
        super(message);
    }
}
