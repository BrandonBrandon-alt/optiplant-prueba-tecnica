package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUnit {
    private Long id;
    private Long productId;
    private Long unitId;
    private BigDecimal conversionFactor;
    private boolean baseUnit;
}
