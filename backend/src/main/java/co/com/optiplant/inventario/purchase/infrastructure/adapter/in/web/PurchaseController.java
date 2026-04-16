package co.com.optiplant.inventario.purchase.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.purchase.application.port.in.CreatePurchaseCommand;
import co.com.optiplant.inventario.purchase.application.port.in.PurchaseUseCase;
import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrder;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchases")
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class PurchaseController {

    private final PurchaseUseCase purchaseUseCase;

    public PurchaseController(PurchaseUseCase purchaseUseCase) {
        this.purchaseUseCase = purchaseUseCase;
    }

    @PostMapping
    public ResponseEntity<PurchaseResponse> createOrder(@Valid @RequestBody PurchaseRequest request) {
        CreatePurchaseCommand command = new CreatePurchaseCommand(
                request.supplierId(),
                request.userId(),
                request.branchId(),
                request.estimatedArrivalDate(),
                request.items().stream()
                        .map(item -> new CreatePurchaseCommand.Detail(item.productId(), item.quantity(), item.unitPrice()))
                        .toList()
        );

        PurchaseOrder order = purchaseUseCase.createOrder(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(PurchaseResponse.fromDomain(order));
    }

    @PostMapping("/{id}/dispatch")
    public ResponseEntity<PurchaseResponse> markAsInTransit(@PathVariable Long id) {
        PurchaseOrder order = purchaseUseCase.markAsInTransit(id);
        return ResponseEntity.ok(PurchaseResponse.fromDomain(order));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseResponse> receiveOrder(
            @PathVariable Long id,
            @RequestParam Long userId) {
        
        PurchaseOrder order = purchaseUseCase.receiveOrder(id, userId);
        return ResponseEntity.ok(PurchaseResponse.fromDomain(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getOrder(@PathVariable Long id) {
        PurchaseOrder order = purchaseUseCase.getOrderById(id);
        return ResponseEntity.ok(PurchaseResponse.fromDomain(order));
    }
}
