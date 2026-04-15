package co.com.optiplant.inventario.purchase.domain.exception;

public class InvalidPurchaseStateException extends RuntimeException {
    public InvalidPurchaseStateException(String message) {
        super(message);
    }
}
