package co.com.optiplant.inventario.analytics.application.port.in;

import co.com.optiplant.inventario.analytics.domain.model.BranchPerformance;
import co.com.optiplant.inventario.analytics.domain.model.BranchValuation;
import co.com.optiplant.inventario.analytics.domain.model.GlobalSummary;
import co.com.optiplant.inventario.analytics.domain.model.TopSellingProduct;
import co.com.optiplant.inventario.analytics.domain.model.SalesTrend;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsUseCase {
    List<TopSellingProduct> getTopSellingProducts(int limit, LocalDateTime startDate, LocalDateTime endDate);
    List<BranchValuation> getBranchValuations();
    GlobalSummary getGlobalSummary(LocalDateTime startDate, LocalDateTime endDate);
    List<BranchPerformance> getBranchPerformance(LocalDateTime startDate, LocalDateTime endDate);
    List<SalesTrend> getSalesTrend(LocalDateTime startDate, LocalDateTime endDate);
}
