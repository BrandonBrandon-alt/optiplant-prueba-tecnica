package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.InventoryUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
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

    @PostMapping("/movement")
    public ResponseEntity<String> registerMovement(@Valid @RequestBody InventoryMovementRequest request) {
        inventoryUseCase.registerMovement(request);
        return ResponseEntity.ok("Movimiento de inventario registrado exitosamente.");
    }
}
