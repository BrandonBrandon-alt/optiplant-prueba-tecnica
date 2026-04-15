package co.com.optiplant.inventario.inventory.application.port.out;

import co.com.optiplant.inventario.inventory.domain.model.LocalInventory;
import java.util.Optional;

public interface LocalInventoryRepositoryPort {
    Optional<LocalInventory> findByBranchAndProduct(Long branchId, Long productId);
    LocalInventory save(LocalInventory localInventory);
}
