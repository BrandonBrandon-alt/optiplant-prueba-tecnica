package co.com.optiplant.inventario.sale.infrastructure.adapter.out.persistence;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalles_venta")
public class SaleDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private SaleEntity sale;

    @Column(name = "producto_id", nullable = false)
    private Long productId;

    @Column(name = "cantidad", nullable = false)
    private Integer quantity;

    @Column(name = "precio_unitario_aplicado", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPriceApplied;

    public SaleDetailEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public SaleEntity getSale() { return sale; }
    public void setSale(SaleEntity sale) { this.sale = sale; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPriceApplied() { return unitPriceApplied; }
    public void setUnitPriceApplied(BigDecimal unitPriceApplied) { this.unitPriceApplied = unitPriceApplied; }
}
