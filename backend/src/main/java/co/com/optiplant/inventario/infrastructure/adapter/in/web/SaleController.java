package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.SaleUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleUseCase saleUseCase;

    public SaleController(SaleUseCase saleUseCase) {
        this.saleUseCase = saleUseCase;
    }

    @PostMapping
    public ResponseEntity<String> registerSale(@Valid @RequestBody SaleRequest request) {
        Long saleId = saleUseCase.registerSale(request);
        return ResponseEntity.ok("Venta registrada exitosamente con ID: " + saleId);
    }
}
