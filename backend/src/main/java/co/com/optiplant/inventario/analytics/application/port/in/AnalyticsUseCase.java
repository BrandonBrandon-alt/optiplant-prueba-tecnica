package co.com.optiplant.inventario.analytics.application.port.in;

import co.com.optiplant.inventario.analytics.domain.model.BranchValuation;
import co.com.optiplant.inventario.analytics.domain.model.TopSellingProduct;

import java.util.List;

public interface AnalyticsUseCase {
    List<TopSellingProduct> getTopSellingProducts(int limit);
    List<BranchValuation> getBranchValuations();
}
