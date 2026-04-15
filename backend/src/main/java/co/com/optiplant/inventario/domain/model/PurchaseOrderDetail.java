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
public class PurchaseOrderDetail {
    private Long id;
    private Long ordenCompraId;
    private Long productoId;
    private BigDecimal cantidad;
    private BigDecimal precioUnitario;

    /**
     * Calcula el subtotal de este ítem (cantidad * precio)
     */
    public BigDecimal getSubtotal() {
        if (cantidad == null || precioUnitario == null) {
            return BigDecimal.ZERO;
        }
        return cantidad.multiply(precioUnitario);
    }
}