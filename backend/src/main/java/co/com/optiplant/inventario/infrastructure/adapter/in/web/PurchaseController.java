package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.PurchaseUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.PurchaseRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.PurchaseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseUseCase purchaseUseCase;

    public PurchaseController(PurchaseUseCase purchaseUseCase) {
        this.purchaseUseCase = purchaseUseCase;
    }

    /** GET /api/purchases — Lista todas las órdenes de compra */
    @GetMapping
    public ResponseEntity<List<PurchaseResponse>> getAll() {
        return ResponseEntity.ok(purchaseUseCase.getAllOrders());
    }

    /** GET /api/purchases/{id} — Detalle de una orden */
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseUseCase.getOrderById(id));
    }

    /** POST /api/purchases — Crear nueva orden en estado PENDIENTE */
    @PostMapping
    public ResponseEntity<Void> create(@RequestBody PurchaseRequest request) {
        Long id = purchaseUseCase.createPurchaseOrder(request);
        return ResponseEntity.created(URI.create("/api/purchases/" + id)).build();
    }

    /** PATCH /api/purchases/{id}/receive — Marcar como RECIBIDA e ingresar al inventario */
    @PatchMapping("/{id}/receive")
    public ResponseEntity<Void> receive(@PathVariable Long id) {
        purchaseUseCase.receivePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/purchases/{id}/cancel — Cancelar una orden PENDIENTE */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        purchaseUseCase.cancelPurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
}
