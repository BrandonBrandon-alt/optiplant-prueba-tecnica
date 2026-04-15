package co.com.optiplant.inventario.purchase.infrastructure.adapter.out.persistence;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalles_compra")
public class PurchaseDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_compra_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    @Column(name = "producto_id", nullable = false)
    private Long productId;

    @Column(name = "cantidad", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantity;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    public PurchaseDetailEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PurchaseOrderEntity getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrderEntity purchaseOrder) { this.purchaseOrder = purchaseOrder; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
