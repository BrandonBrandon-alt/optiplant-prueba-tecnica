package co.com.optiplant.inventario.inventory.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.domain.model.InventoryMovement;
import co.com.optiplant.inventario.inventory.domain.model.LocalInventory;
import co.com.optiplant.inventario.inventory.infrastructure.adapter.in.web.dto.StockRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryUseCase inventoryUseCase;

    public InventoryController(InventoryUseCase inventoryUseCase) {
        this.inventoryUseCase = inventoryUseCase;
    }

    @GetMapping("/branches/{branchId}/products/{productId}")
    public ResponseEntity<LocalInventory> getInventory(
            @PathVariable Long branchId, 
            @PathVariable Long productId) {
        LocalInventory inventory = inventoryUseCase.getInventory(branchId, productId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/branches/{branchId}")
    public ResponseEntity<List<LocalInventory>> getInventoryByBranch(
            @PathVariable Long branchId) {
        return ResponseEntity.ok(inventoryUseCase.getInventoryByBranch(branchId));
    }

    @PutMapping("/branches/{branchId}/products/{productId}/config")
    public ResponseEntity<LocalInventory> updateConfig(
            @PathVariable Long branchId,
            @PathVariable Long productId,
            @RequestParam BigDecimal minimumStock) {
        return ResponseEntity.ok(inventoryUseCase.updateMinimumStock(branchId, productId, minimumStock));
    }

    @GetMapping("/branches/{branchId}/products/{productId}/kardex")
    public ResponseEntity<List<InventoryMovement>> getKardex(
            @PathVariable Long branchId, 
            @PathVariable Long productId) {
        List<InventoryMovement> kardex = inventoryUseCase.getKardex(branchId, productId);
        return ResponseEntity.ok(kardex);
    }

    @PostMapping("/branches/{branchId}/products/{productId}/withdraw")
    public ResponseEntity<Void> withdrawStock(
            @PathVariable Long branchId,
            @PathVariable Long productId,
            @Valid @RequestBody StockRequest request) {
        
        inventoryUseCase.withdrawStock(
                branchId, 
                productId, 
                request.getQuantity(), 
                request.getReason(), 
                request.getUserId(), 
                request.getReferenceId(), 
                request.getReferenceType());
                
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/branches/{branchId}/products/{productId}/add")
    public ResponseEntity<Void> addStock(
            @PathVariable Long branchId,
            @PathVariable Long productId,
            @Valid @RequestBody StockRequest request) {
        
        inventoryUseCase.addStock(
                branchId, 
                productId, 
                request.getQuantity(), 
                request.getReason(), 
                request.getUserId(), 
                request.getReferenceId(), 
                request.getReferenceType(),
                request.getUnitCost());
                
        return ResponseEntity.noContent().build();
    }
}
