package co.com.optiplant.inventario.sale.domain.model;

import co.com.optiplant.inventario.sale.domain.exception.EmptySaleException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class Sale {
    private Long id;
    private LocalDateTime date;
    private BigDecimal total;
    private Long branchId;
    private Long userId;
    private List<SaleDetail> details;

    public Sale(Long id, LocalDateTime date, BigDecimal total, Long branchId, Long userId, List<SaleDetail> details) {
        if (details == null || details.isEmpty()) {
            throw new EmptySaleException("Una factura de venta no puede estar vacía.");
        }
        if (branchId == null) {
            throw new IllegalArgumentException("La sucursal es obligatoria.");
        }
        if (userId == null) {
            throw new IllegalArgumentException("El usuario es obligatorio.");
        }
        
        this.id = id;
        this.date = date != null ? date : LocalDateTime.now();
        this.branchId = branchId;
        this.userId = userId;
        this.details = details;
        
        // Recalculate total to ensure integrity
        this.total = calculateTotal();
    }

    public static Sale create(Long branchId, Long userId, List<SaleDetail> details) {
        return new Sale(null, LocalDateTime.now(), null, branchId, userId, details);
    }

    private BigDecimal calculateTotal() {
        return this.details.stream()
                .map(SaleDetail::computeSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters
    public Long getId() { return id; }
    public LocalDateTime getDate() { return date; }
    public BigDecimal getTotal() { return total; }
    public Long getBranchId() { return branchId; }
    public Long getUserId() { return userId; }
    public List<SaleDetail> getDetails() { return Collections.unmodifiableList(details); }
}
