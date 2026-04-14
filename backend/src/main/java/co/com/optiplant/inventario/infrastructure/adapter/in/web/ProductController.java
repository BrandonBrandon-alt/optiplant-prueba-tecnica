package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.ProductUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.ProductResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductUseCase productUseCase;

    public ProductController(ProductUseCase productUseCase) {
        this.productUseCase = productUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        List<ProductResponse> products = productUseCase.getAllProducts()
                .stream()
                .map(p -> ProductResponse.builder()
                        .id(p.getId())
                        .sku(p.getSku())
                        .name(p.getName())
                        .averageCost(p.getAverageCost())
                        .salePrice(p.getSalePrice())
                        .supplierId(p.getSupplierId())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{sku}")
    public ResponseEntity<ProductResponse> getBySku(@PathVariable String sku) {
        var p = productUseCase.getProductBySku(sku);
        return ResponseEntity.ok(ProductResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .averageCost(p.getAverageCost())
                .salePrice(p.getSalePrice())
                .supplierId(p.getSupplierId())
                .build());
    }
}
