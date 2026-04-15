package co.com.optiplant.inventario.alert.domain.model;

import co.com.optiplant.inventario.alert.domain.exception.AlertAlreadyResolvedException;

import java.time.LocalDateTime;

public class StockAlert {
    private Long id;
    private Long branchId;
    private Long productId;
    private String message;
    private LocalDateTime alertDate;
    private boolean resolved;

    public StockAlert(Long id, Long branchId, Long productId, String message, LocalDateTime alertDate, boolean resolved) {
        if (branchId == null || productId == null) {
            throw new IllegalArgumentException("La sucursal y el producto son obligatorios para una alerta.");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("El mensaje de la alerta no puede estar vacío.");
        }

        this.id = id;
        this.branchId = branchId;
        this.productId = productId;
        this.message = message;
        this.alertDate = alertDate != null ? alertDate : LocalDateTime.now();
        this.resolved = resolved;
    }

    public static StockAlert create(Long branchId, Long productId, String message) {
        return new StockAlert(null, branchId, productId, message, LocalDateTime.now(), false);
    }

    public void resolve() {
        if (this.resolved) {
            throw new AlertAlreadyResolvedException("Esta alerta de stock ya se encuentra resuelta.");
        }
        this.resolved = true;
    }

    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public Long getProductId() { return productId; }
    public String getMessage() { return message; }
    public LocalDateTime getAlertDate() { return alertDate; }
    public boolean isResolved() { return resolved; }
}
