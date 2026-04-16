package co.com.optiplant.inventario.analytics.infrastructure.adapter.out.persistence;

import co.com.optiplant.inventario.analytics.application.port.out.AnalyticsRepositoryPort;
import co.com.optiplant.inventario.analytics.domain.model.BranchPerformance;
import co.com.optiplant.inventario.analytics.domain.model.BranchValuation;
import co.com.optiplant.inventario.analytics.domain.model.GlobalSummary;
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

    @Override
    public GlobalSummary findGlobalSummary() {
        String query = """
                SELECT 
                    (SELECT COALESCE(SUM(total_final), 0) FROM ventas) as total_revenue,
                    (SELECT COALESCE(SUM(cantidad), 0) FROM detalles_venta) as total_units,
                    (SELECT COALESCE(SUM(i.cantidad_actual * p.costo_promedio), 0) 
                     FROM inventario_local i JOIN producto p ON i.producto_id = p.id) as total_value,
                    (SELECT COALESCE(AVG(total_final), 0) FROM ventas) as avg_ticket,
                    (SELECT COUNT(*) FROM sucursal WHERE activa = true) as branch_count
                """;

        return jdbcTemplate.queryForObject(query, (rs, rowNum) -> new GlobalSummary(
                rs.getBigDecimal("total_revenue"),
                rs.getBigDecimal("total_units"),
                rs.getBigDecimal("total_value"),
                rs.getBigDecimal("avg_ticket"),
                rs.getLong("branch_count")
        ));
    }

    @Override
    public List<BranchPerformance> findBranchPerformance() {
        String query = """
                SELECT 
                    s.id as branch_id, 
                    s.nombre as branch_name, 
                    COALESCE(SUM(v.total_final), 0) as revenue,
                    COALESCE(SUM(dv.cantidad), 0) as units_sold,
                    COUNT(DISTINCT v.id) as sales_count
                FROM sucursal s
                LEFT JOIN ventas v ON s.id = v.sucursal_id
                LEFT JOIN detalles_venta dv ON v.id = dv.venta_id
                WHERE s.activa = true
                GROUP BY s.id, s.nombre
                ORDER BY revenue DESC
                """;

        return jdbcTemplate.query(query, (rs, rowNum) -> new BranchPerformance(
                rs.getLong("branch_id"),
                rs.getString("branch_name"),
                rs.getBigDecimal("revenue"),
                rs.getBigDecimal("units_sold"),
                rs.getLong("sales_count")
        ));
    }
}
