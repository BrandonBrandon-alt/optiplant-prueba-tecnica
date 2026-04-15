package co.com.optiplant.inventario.purchase.domain.model;

import co.com.optiplant.inventario.purchase.domain.exception.InvalidPurchaseStateException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class PurchaseOrder {
    private Long id;
    private PurchaseOrderStatus status;
    private LocalDateTime requestDate;
    private LocalDateTime estimatedArrivalDate;
    private Long supplierId;
    private Long userId;
    private Long branchId;
    private List<PurchaseOrderDetail> details;

    public PurchaseOrder(Long id, PurchaseOrderStatus status, LocalDateTime requestDate, LocalDateTime estimatedArrivalDate, Long supplierId, Long userId, Long branchId, List<PurchaseOrderDetail> details) {
        if (supplierId == null) {
            throw new IllegalArgumentException("El proveedor es obligatorio.");
        }
        if (branchId == null) {
            throw new IllegalArgumentException("La sucursal de destino es obligatoria.");
        }
        if (details == null || details.isEmpty()) {
            throw new IllegalArgumentException("La orden de compra debe tener al menos un producto.");
        }

        this.id = id;
        this.status = status != null ? status : PurchaseOrderStatus.PENDING;
        this.requestDate = requestDate != null ? requestDate : LocalDateTime.now();
        this.estimatedArrivalDate = estimatedArrivalDate;
        this.supplierId = supplierId;
        this.userId = userId;
        this.branchId = branchId;
        this.details = details;
    }

    public static PurchaseOrder create(Long supplierId, Long userId, Long branchId, LocalDateTime estimatedArrivalDate, List<PurchaseOrderDetail> details) {
        return new PurchaseOrder(null, PurchaseOrderStatus.PENDING, LocalDateTime.now(), estimatedArrivalDate, supplierId, userId, branchId, details);
    }

    public void markAsInTransit() {
        if (this.status != PurchaseOrderStatus.PENDING) {
            throw new InvalidPurchaseStateException("Solo se puede despachar una orden en estado PENDING.");
        }
        this.status = PurchaseOrderStatus.IN_TRANSIT;
    }

    public void receive() {
        if (this.status != PurchaseOrderStatus.IN_TRANSIT && this.status != PurchaseOrderStatus.PENDING) {
            throw new InvalidPurchaseStateException("Solo se puede recibir una orden IN_TRANSIT o PENDING.");
        }
        this.status = PurchaseOrderStatus.RECEIVED;
    }

    public void cancel() {
        if (this.status != PurchaseOrderStatus.PENDING) {
            throw new InvalidPurchaseStateException("Solo se pueden cancelar órdenes en estado PENDING.");
        }
        this.status = PurchaseOrderStatus.CANCELLED;
    }

    public Long getId() { return id; }
    public PurchaseOrderStatus getStatus() { return status; }
    public LocalDateTime getRequestDate() { return requestDate; }
    public LocalDateTime getEstimatedArrivalDate() { return estimatedArrivalDate; }
    public Long getSupplierId() { return supplierId; }
    public Long getUserId() { return userId; }
    public Long getBranchId() { return branchId; }
    public List<PurchaseOrderDetail> getDetails() { return Collections.unmodifiableList(details); }
}
