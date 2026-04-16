package co.com.optiplant.inventario.analytics.application.port.out;

import co.com.optiplant.inventario.analytics.domain.model.BranchPerformance;
import co.com.optiplant.inventario.analytics.domain.model.BranchValuation;
import co.com.optiplant.inventario.analytics.domain.model.GlobalSummary;
import co.com.optiplant.inventario.analytics.domain.model.TopSellingProduct;

import java.util.List;

public interface AnalyticsRepositoryPort {
    List<TopSellingProduct> findTopSellingProducts(int limit);
    List<BranchValuation> findBranchValuations();
    GlobalSummary findGlobalSummary();
    List<BranchPerformance> findBranchPerformance();
}
