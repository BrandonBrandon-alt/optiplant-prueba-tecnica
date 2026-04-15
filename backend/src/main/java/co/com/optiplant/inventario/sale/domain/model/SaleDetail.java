package co.com.optiplant.inventario.sale.domain.model;

import java.math.BigDecimal;

public class SaleDetail {
    private Long id;
    private Long productId;
    private Integer quantity;
    private BigDecimal unitPriceApplied;

    public SaleDetail(Long id, Long productId, Integer quantity, BigDecimal unitPriceApplied) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero.");
        }
        if (unitPriceApplied == null || unitPriceApplied.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio unitario no puede ser negativo.");
        }
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPriceApplied = unitPriceApplied;
    }

    public static SaleDetail create(Long productId, Integer quantity, BigDecimal unitPriceApplied) {
        return new SaleDetail(null, productId, quantity, unitPriceApplied);
    }

    public BigDecimal computeSubtotal() {
        return this.unitPriceApplied.multiply(BigDecimal.valueOf(this.quantity));
    }

    // Getters
    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getUnitPriceApplied() { return unitPriceApplied; }
}
