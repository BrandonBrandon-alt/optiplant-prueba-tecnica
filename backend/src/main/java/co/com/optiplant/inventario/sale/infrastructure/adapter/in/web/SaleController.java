package co.com.optiplant.inventario.sale.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.sale.application.port.in.CreateSaleCommand;
import co.com.optiplant.inventario.sale.application.port.in.CreateSaleUseCase;
import co.com.optiplant.inventario.sale.domain.model.Sale;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales")
public class SaleController {

    private final CreateSaleUseCase createSaleUseCase;

    public SaleController(CreateSaleUseCase createSaleUseCase) {
        this.createSaleUseCase = createSaleUseCase;
    }

    @PostMapping
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody SaleRequest request) {
        CreateSaleCommand command = new CreateSaleCommand(
                request.branchId(),
                request.userId(),
                request.items().stream()
                        .map(item -> new CreateSaleCommand.Detail(item.productId(), item.quantity()))
                        .toList()
        );

        Sale sale = createSaleUseCase.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(SaleResponse.fromDomain(sale));
    }
}
