package co.com.optiplant.inventario.analytics.application.service;

import co.com.optiplant.inventario.analytics.application.port.in.AnalyticsUseCase;
import co.com.optiplant.inventario.analytics.application.port.out.AnalyticsRepositoryPort;
import co.com.optiplant.inventario.analytics.domain.model.BranchPerformance;
import co.com.optiplant.inventario.analytics.domain.model.BranchValuation;
import co.com.optiplant.inventario.analytics.domain.model.GlobalSummary;
import co.com.optiplant.inventario.analytics.domain.model.TopSellingProduct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService implements AnalyticsUseCase {

    private final AnalyticsRepositoryPort analyticsRepository;

    public AnalyticsService(AnalyticsRepositoryPort analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    @Override
    public List<TopSellingProduct> getTopSellingProducts(int limit) {
        if (limit <= 0) {
            limit = 5;
        }
        return analyticsRepository.findTopSellingProducts(limit);
    }

    @Override
    public List<BranchValuation> getBranchValuations() {
        return analyticsRepository.findBranchValuations();
    }

    @Override
    public GlobalSummary getGlobalSummary() {
        return analyticsRepository.findGlobalSummary();
    }

    @Override
    public List<BranchPerformance> getBranchPerformance() {
        return analyticsRepository.findBranchPerformance();
    }
}
