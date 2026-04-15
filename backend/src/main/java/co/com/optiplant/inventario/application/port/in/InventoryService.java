// ─────────────────────────────────────────────────────────────────────────────
// IInventoryService.java
// ─────────────────────────────────────────────────────────────────────────────
package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.domain.model.LocalInventory;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementResponse;

import java.util.List;

/**
 * Puerto de entrada para movimientos de inventario y kardex.
 */
public interface InventoryService {

    List<LocalInventory> getInventoryByBranch(Long branchId);

    void registerMovement(InventoryMovementRequest request);

    List<InventoryMovementResponse> getKardexByBranch(Long branchId);

    List<InventoryMovementResponse> getKardexByBranchAndProduct(Long branchId, Long productId);
}