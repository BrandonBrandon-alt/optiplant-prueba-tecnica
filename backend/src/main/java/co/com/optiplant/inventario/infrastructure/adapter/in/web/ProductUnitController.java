package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.ProductUnitUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.ProductUnitRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.ProductUnitResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/product-units")
public class ProductUnitController {

    private final ProductUnitUseCase productUnitUseCase;

    public ProductUnitController(ProductUnitUseCase productUnitUseCase) {
        this.productUnitUseCase = productUnitUseCase;
    }

    /** GET /api/product-units/product/{productId} — Lista todas las presentaciones de un producto */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductUnitResponse>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productUnitUseCase.getByProductId(productId));
    }

    /** POST /api/product-units — Asigna una unidad de medida a un producto */
    @PostMapping
    public ResponseEntity<ProductUnitResponse> assign(@Valid @RequestBody ProductUnitRequest request) {
        ProductUnitResponse created = productUnitUseCase.assignUnit(request);
        return ResponseEntity.created(URI.create("/api/product-units/" + created.getId())).body(created);
    }

    /** PUT /api/product-units/{id} — Actualiza factor de conversión o flag base */
    @PutMapping("/{id}")
    public ResponseEntity<ProductUnitResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody ProductUnitRequest request) {
        return ResponseEntity.ok(productUnitUseCase.update(id, request));
    }

    /** DELETE /api/product-units/{id} — Elimina una presentación de producto */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productUnitUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
