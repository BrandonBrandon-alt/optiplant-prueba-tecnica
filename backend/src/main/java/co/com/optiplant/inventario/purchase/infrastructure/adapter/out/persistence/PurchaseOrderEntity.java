package co.com.optiplant.inventario.purchase.infrastructure.adapter.out.persistence;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordenes_compra")
public class PurchaseOrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "estado", nullable = false)
    private String status;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "fecha_estimada_llegada")
    private LocalDateTime estimatedArrivalDate;

    @Column(name = "proveedor_id", nullable = false)
    private Long supplierId;

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    @Column(name = "sucursal_id", nullable = false)
    private Long branchId;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseDetailEntity> details = new ArrayList<>();

    public PurchaseOrderEntity() {}

    public void addDetail(PurchaseDetailEntity detail) {
        details.add(detail);
        detail.setPurchaseOrder(this);
    }

    public void removeDetail(PurchaseDetailEntity detail) {
        details.remove(detail);
        detail.setPurchaseOrder(null);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }

    public LocalDateTime getEstimatedArrivalDate() { return estimatedArrivalDate; }
    public void setEstimatedArrivalDate(LocalDateTime estimatedArrivalDate) { this.estimatedArrivalDate = estimatedArrivalDate; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public List<PurchaseDetailEntity> getDetails() { return details; }
    public void setDetails(List<PurchaseDetailEntity> details) { this.details = details; }
}
