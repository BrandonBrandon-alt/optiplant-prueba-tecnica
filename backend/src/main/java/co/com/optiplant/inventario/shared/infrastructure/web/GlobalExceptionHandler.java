package co.com.optiplant.inventario.shared.infrastructure.web;

import co.com.optiplant.inventario.branch.domain.exception.BranchNotFoundException;
import co.com.optiplant.inventario.catalog.domain.exception.DuplicateSkuException;
import co.com.optiplant.inventario.catalog.domain.exception.ProductNotFoundException;
import co.com.optiplant.inventario.catalog.domain.exception.SupplierNotFoundException;
import co.com.optiplant.inventario.catalog.domain.exception.UnitOfMeasureNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para toda la API.
 * Traduce excepciones de dominio al protocolo HTTP con formato uniforme (ErrorResponse).
 *
 * <p>Los handlers más específicos tienen prioridad sobre el fallback genérico.</p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 404 – Sucursal no encontrada. */
    @ExceptionHandler(BranchNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBranchNotFound(BranchNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }

    /** 404 – Producto no encontrado. */
    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProductNotFound(ProductNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }

    /** 404 – Proveedor no encontrado. */
    @ExceptionHandler(SupplierNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleSupplierNotFound(SupplierNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }

    /** 404 – Unidad de medida no encontrada. */
    @ExceptionHandler(UnitOfMeasureNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUnitNotFound(UnitOfMeasureNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }

    /** 409 – SKU de producto duplicado. */
    @ExceptionHandler(DuplicateSkuException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateSku(DuplicateSkuException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
    }

    /** 400 – Fallo de validación Bean Validation (@Valid). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(message));
    }

    /** 500 – Fallback para excepciones no manejadas explícitamente. */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleGeneral(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(ex.getMessage()));
    }
}
