package co.com.optiplant.inventario.sale.domain.model;

import co.com.optiplant.inventario.sale.domain.exception.EmptySaleException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class Sale {
    private Long id;
    private LocalDateTime date;
    private BigDecimal subtotal;
    private BigDecimal totalDiscount;
    private BigDecimal totalFinal;
    private Long branchId;
    private String branchName;
    private Long userId;
    private String userName;
    private SaleStatus status;
    private String cancellationReason;
    private String customerName;
    private String customerDocument;
    private List<SaleDetail> details;

    public Sale(Long id, LocalDateTime date, Long branchId, String branchName, Long userId, String userName, SaleStatus status, 
                String cancellationReason, String customerName, String customerDocument, List<SaleDetail> details) {
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
        this.branchName = branchName;
        this.userId = userId;
        this.userName = userName;
        this.status = status != null ? status : SaleStatus.COMPLETED;
        this.cancellationReason = cancellationReason;
        this.customerName = customerName;
        this.customerDocument = customerDocument;
        this.details = details;
        
        // Calcular matemática financiera en el backend (Source of Truth)
        calculateFinancials();
    }

    public static Sale create(Long branchId, String branchName, Long userId, String userName, String customerName, String customerDocument, List<SaleDetail> details) {
        return new Sale(null, LocalDateTime.now(), branchId, branchName, userId, userName, SaleStatus.COMPLETED, null, customerName, customerDocument, details);
    }

    public void cancel(String reason) {
        if (this.status == SaleStatus.CANCELED) {
            throw new IllegalStateException("Esta venta ya se encuentra anulada.");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("El motivo de la anulación es obligatorio.");
        }
        this.status = SaleStatus.CANCELED;
        this.cancellationReason = reason;
    }

    private void calculateFinancials() {
        // Subtotal: Suma de (cantidad * precio_pactado) de cada línea
        this.subtotal = this.details.stream()
                .map(d -> d.getUnitPriceApplied().multiply(BigDecimal.valueOf(d.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Total Final: Suma de los subtotales de línea (ya con descuento)
        this.totalFinal = this.details.stream()
                .map(SaleDetail::getSubtotalLine)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Descuento Total: Diferencia entre subtotal y total final
        this.totalDiscount = this.subtotal.subtract(this.totalFinal);
    }

    // Getters
    public Long getId() { return id; }
    public LocalDateTime getDate() { return date; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public BigDecimal getTotalFinal() { return totalFinal; }
    public Long getBranchId() { return branchId; }
    public String getBranchName() { return branchName; }
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public SaleStatus getStatus() { return status; }
    public String getCancellationReason() { return cancellationReason; }
    public String getCustomerName() { return customerName; }
    public String getCustomerDocument() { return customerDocument; }
    public List<SaleDetail> getDetails() { return Collections.unmodifiableList(details); }
}
