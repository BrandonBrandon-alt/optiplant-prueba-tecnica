package co.com.optiplant.inventario.shared.infrastructure.web;

import co.com.optiplant.inventario.branch.domain.exception.BranchNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para toda la API.
 * Responsabilidad única: traducir excepciones de dominio/aplicación
 * al protocolo HTTP con un formato de respuesta uniforme (ErrorResponse).
 *
 * Orden de precedencia: los handlers más específicos (por tipo de excepción)
 * tienen prioridad sobre el handler genérico de RuntimeException.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 404 – La sucursal solicitada no existe.
     */
    @ExceptionHandler(BranchNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBranchNotFound(BranchNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getMessage()));
    }

    /**
     * 400 – Fallo de validación de Bean Validation (@Valid en el controlador).
     * Consolida todos los errores de campo en un único mensaje.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(message));
    }

    /**
     * 500 – Fallback para cualquier excepción no manejada explícitamente.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleGeneral(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(ex.getMessage()));
    }
}
