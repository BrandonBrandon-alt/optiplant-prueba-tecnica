package co.com.optiplant.inventario.purchase.domain.model;

import java.math.BigDecimal;

public class PurchaseOrderDetail {
    private Long id;
    private Long productId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;

    public PurchaseOrderDetail(Long id, Long productId, BigDecimal quantity, BigDecimal unitPrice) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La cantidad comprada debe ser mayor a cero.");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio unitario no puede ser negativo.");
        }
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public static PurchaseOrderDetail create(Long productId, BigDecimal quantity, BigDecimal unitPrice) {
        return new PurchaseOrderDetail(null, productId, quantity, unitPrice);
    }

    public BigDecimal computeSubtotal() {
        return this.unitPrice.multiply(this.quantity);
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
