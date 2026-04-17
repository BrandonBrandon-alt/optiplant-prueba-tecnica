package co.com.optiplant.inventario.analytics.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesTrend(
        LocalDate saleDate,
        BigDecimal revenue
) {
}
