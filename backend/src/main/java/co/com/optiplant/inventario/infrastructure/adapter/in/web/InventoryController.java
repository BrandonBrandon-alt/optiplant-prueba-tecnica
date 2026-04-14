package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.InventoryUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementResponse;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.LocalInventoryResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryUseCase inventoryUseCase;

    public InventoryController(InventoryUseCase inventoryUseCase) {
        this.inventoryUseCase = inventoryUseCase;
    }

    /** GET /api/inventory/branch/{branchId} — Stock actual de todos los productos en una sucursal */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<LocalInventoryResponse>> getInventoryByBranch(@PathVariable Long branchId) {
        List<LocalInventoryResponse> inventory = inventoryUseCase.getInventoryByBranch(branchId)
                .stream()
                .map(inv -> LocalInventoryResponse.builder()
                        .branchId(inv.getSucursal().getId())
                        .productId(inv.getProducto().getId())
                        .productName(inv.getProducto().getNombre())
                        .currentQuantity(inv.getCantidadActual())
                        .minimumStock(inv.getStockMinimo())
                        .lastUpdated(inv.getLastUpdated())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(inventory);
    }

    /** POST /api/inventory/movement — Registrar un movimiento manual (ajuste, merma, etc.) */
    @PostMapping("/movement")
    public ResponseEntity<Void> registerMovement(@Valid @RequestBody InventoryMovementRequest request) {
        inventoryUseCase.registerMovement(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/inventory/kardex/{branchId}
     * Kardex completo de una sucursal, ordenado del más reciente al más antiguo.
     */
    @GetMapping("/kardex/{branchId}")
    public ResponseEntity<List<InventoryMovementResponse>> getKardex(@PathVariable Long branchId) {
        return ResponseEntity.ok(inventoryUseCase.getKardexByBranch(branchId));
    }

    /**
     * GET /api/inventory/kardex/{branchId}/product/{productId}
     * Kardex de un producto específico en una sucursal.
     */
    @GetMapping("/kardex/{branchId}/product/{productId}")
    public ResponseEntity<List<InventoryMovementResponse>> getKardexByProduct(
            @PathVariable Long branchId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(inventoryUseCase.getKardexByBranchAndProduct(branchId, productId));
    }
}
