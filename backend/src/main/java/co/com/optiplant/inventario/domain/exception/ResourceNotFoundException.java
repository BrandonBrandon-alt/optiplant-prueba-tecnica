package co.com.optiplant.inventario.domain.exception;

public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s no encontrado con %s: '%s'", resource, field, value));
    }
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
