package co.com.optiplant.inventario.inventory.application.service;

import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.application.port.out.InventoryMovementRepositoryPort;
import co.com.optiplant.inventario.inventory.application.port.out.LocalInventoryRepositoryPort;
import co.com.optiplant.inventario.inventory.domain.exception.InsufficientStockException;
import co.com.optiplant.inventario.inventory.domain.exception.InventoryNotFoundException;
import co.com.optiplant.inventario.inventory.domain.model.InventoryMovement;
import co.com.optiplant.inventario.inventory.domain.model.LocalInventory;
import co.com.optiplant.inventario.inventory.domain.model.MovementReason;
import co.com.optiplant.inventario.inventory.domain.model.MovementType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService implements InventoryUseCase {

    private final LocalInventoryRepositoryPort localInventoryRepository;
    private final InventoryMovementRepositoryPort inventoryMovementRepository;

    public InventoryService(LocalInventoryRepositoryPort localInventoryRepository,
                            InventoryMovementRepositoryPort inventoryMovementRepository) {
        this.localInventoryRepository = localInventoryRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
    }

    @Override
    public LocalInventory getInventory(Long branchId, Long productId) {
        return localInventoryRepository.findByBranchAndProduct(branchId, productId)
                .orElseThrow(() -> new InventoryNotFoundException(branchId, productId));
    }

    @Override
    @Transactional
    public void withdrawStock(Long branchId, Long productId, BigDecimal quantity, MovementReason reason, Long userId, Long referenceId, String referenceType) {
        LocalInventory inventory = getInventory(branchId, productId);
        
        if (!inventory.hasSufficientStock(quantity)) {
            throw new InsufficientStockException(branchId, productId, quantity, inventory.getCurrentQuantity());
        }

        inventory.setCurrentQuantity(inventory.getCurrentQuantity().subtract(quantity));
        inventory.setLastUpdated(LocalDateTime.now());
        localInventoryRepository.save(inventory);

        InventoryMovement movement = InventoryMovement.builder()
                .type(MovementType.RETIRO)
                .reason(reason)
                .quantity(quantity)
                .date(LocalDateTime.now())
                .productId(productId)
                .branchId(branchId)
                .userId(userId)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
        inventoryMovementRepository.save(movement);
    }

    @Override
    @Transactional
    public void addStock(Long branchId, Long productId, BigDecimal quantity, MovementReason reason, Long userId, Long referenceId, String referenceType) {
        LocalInventory inventory = localInventoryRepository.findByBranchAndProduct(branchId, productId)
                .orElseGet(() -> LocalInventory.builder()
                        .branchId(branchId)
                        .productId(productId)
                        .currentQuantity(BigDecimal.ZERO)
                        .minimumStock(BigDecimal.ZERO) // configurable luego
                        .build());

        inventory.setCurrentQuantity(inventory.getCurrentQuantity().add(quantity));
        inventory.setLastUpdated(LocalDateTime.now());
        localInventoryRepository.save(inventory);

        InventoryMovement movement = InventoryMovement.builder()
                .type(MovementType.INGRESO)
                .reason(reason)
                .quantity(quantity)
                .date(LocalDateTime.now())
                .productId(productId)
                .branchId(branchId)
                .userId(userId)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
        inventoryMovementRepository.save(movement);
    }

    @Override
    public List<InventoryMovement> getKardex(Long branchId, Long productId) {
        return inventoryMovementRepository.findByBranchAndProduct(branchId, productId);
    }
}
