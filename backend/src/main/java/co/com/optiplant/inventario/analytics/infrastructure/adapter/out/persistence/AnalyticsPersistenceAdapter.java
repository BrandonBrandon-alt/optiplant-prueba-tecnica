package co.com.optiplant.inventario.analytics.infrastructure.adapter.out.persistence;

import co.com.optiplant.inventario.analytics.application.port.out.AnalyticsRepositoryPort;
import co.com.optiplant.inventario.analytics.domain.model.BranchValuation;
import co.com.optiplant.inventario.analytics.domain.model.TopSellingProduct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AnalyticsPersistenceAdapter implements AnalyticsRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsPersistenceAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<TopSellingProduct> findTopSellingProducts(int limit) {
        String query = """
                SELECT p.id as product_id, p.nombre as product_name, SUM(d.cantidad) as total_sold
                FROM detalles_venta d
                JOIN producto p ON d.producto_id = p.id
                GROUP BY p.id, p.nombre
                ORDER BY total_sold DESC
                LIMIT ?
                """;

        return jdbcTemplate.query(query, (rs, rowNum) -> new TopSellingProduct(
                rs.getLong("product_id"),
                rs.getString("product_name"),
                rs.getBigDecimal("total_sold")
        ), limit);
    }

    @Override
    public List<BranchValuation> findBranchValuations() {
        String query = """
                SELECT s.id as branch_id, s.nombre as branch_name, SUM(i.cantidad_actual * p.costo_promedio) as total_value
                FROM inventario_local i
                JOIN sucursal s ON i.sucursal_id = s.id
                JOIN producto p ON i.producto_id = p.id
                GROUP BY s.id, s.nombre
                ORDER BY total_value DESC
                """;

        return jdbcTemplate.query(query, (rs, rowNum) -> new BranchValuation(
                rs.getLong("branch_id"),
                rs.getString("branch_name"),
                rs.getBigDecimal("total_value")
        ));
    }
}
