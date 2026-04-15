package co.com.optiplant.inventario.catalog.infrastructure.adapter.out.persistence;

import co.com.optiplant.inventario.catalog.domain.model.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla {@code producto} de la base de datos.
 *
 * <p>Es un objeto de infraestructura puro: conoce JPA pero el dominio
 * no la conoce. Los métodos {@link #toDomain()} y {@link #fromDomain(Product)}
 * son los únicos puntos de conversión entre las dos representaciones.</p>
 */
@Entity
@Table(name = "producto")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** SKU único del producto, mapeado a la columna {@code sku}. */
    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "nombre", nullable = false, length = 150)
    private String name;

    @Column(name = "costo_promedio", precision = 12, scale = 2)
    private BigDecimal averageCost;

    @Column(name = "precio_venta", precision = 12, scale = 2)
    private BigDecimal salePrice;

    /**
     * Referencia al ID del proveedor. Se guarda como clave foránea escalar
     * para no crear un join eager innecesario con la entidad Proveedor.
     */
    @Column(name = "proveedor_id")
    private Long supplierId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Mappers ─────────────────────────────────────────────────────────────

    /** Convierte la entidad JPA al modelo de dominio puro. */
    public Product toDomain() {
        return Product.builder()
                .id(this.id)
                .sku(this.sku)
                .name(this.name)
                .averageCost(this.averageCost)
                .salePrice(this.salePrice)
                .supplierId(this.supplierId)
                .createdAt(this.createdAt)
                .build();
    }

    /** Construye una {@code ProductEntity} a partir del modelo de dominio. */
    public static ProductEntity fromDomain(Product product) {
        return ProductEntity.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .averageCost(product.getAverageCost())
                .salePrice(product.getSalePrice())
                .supplierId(product.getSupplierId())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
