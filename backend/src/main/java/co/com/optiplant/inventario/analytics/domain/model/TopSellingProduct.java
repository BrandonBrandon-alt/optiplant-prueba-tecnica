package co.com.optiplant.inventario.analytics.domain.model;

import java.math.BigDecimal;

public record TopSellingProduct(
        Long productId,
        String productName,
        BigDecimal totalSoldQuantity
) {}
