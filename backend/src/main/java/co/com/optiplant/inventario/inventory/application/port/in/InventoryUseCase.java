package co.com.optiplant.inventario.inventory.application.port.in;

import co.com.optiplant.inventario.inventory.domain.model.LocalInventory;
import co.com.optiplant.inventario.inventory.domain.model.InventoryMovement;
import co.com.optiplant.inventario.inventory.domain.model.MovementReason;

import java.math.BigDecimal;
import java.util.List;

public interface InventoryUseCase {
    
    LocalInventory getInventory(Long branchId, Long productId);
    
    void withdrawStock(
            Long branchId, 
            Long productId, 
            BigDecimal quantity, 
            MovementReason reason, 
            Long userId, 
            Long referenceId, 
            String referenceType
    );
    
    void addStock(
            Long branchId, 
            Long productId, 
            BigDecimal quantity, 
            MovementReason reason, 
            Long userId, 
            Long referenceId, 
            String referenceType
    );

    List<InventoryMovement> getKardex(Long branchId, Long productId);
}
