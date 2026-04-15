package co.com.optiplant.inventario.analytics.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.analytics.application.port.in.AnalyticsUseCase;
import co.com.optiplant.inventario.analytics.domain.model.BranchValuation;
import co.com.optiplant.inventario.analytics.domain.model.TopSellingProduct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsUseCase analyticsUseCase;

    public AnalyticsController(AnalyticsUseCase analyticsUseCase) {
        this.analyticsUseCase = analyticsUseCase;
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopSellingProduct>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<TopSellingProduct> products = analyticsUseCase.getTopSellingProducts(limit);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/valuations")
    public ResponseEntity<List<BranchValuation>> getBranchValuations() {
        List<BranchValuation> valuations = analyticsUseCase.getBranchValuations();
        return ResponseEntity.ok(valuations);
    }
}
