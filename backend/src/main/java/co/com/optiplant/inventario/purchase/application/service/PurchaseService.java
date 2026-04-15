package co.com.optiplant.inventario.purchase.application.service;

import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.domain.model.MovementReason;
import co.com.optiplant.inventario.purchase.application.port.in.CreatePurchaseCommand;
import co.com.optiplant.inventario.purchase.application.port.in.PurchaseUseCase;
import co.com.optiplant.inventario.purchase.application.port.out.PurchaseRepositoryPort;
import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrder;
import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrderDetail;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PurchaseService implements PurchaseUseCase {

    private final PurchaseRepositoryPort repository;
    private final InventoryUseCase inventoryUseCase;

    public PurchaseService(PurchaseRepositoryPort repository, InventoryUseCase inventoryUseCase) {
        this.repository = repository;
        this.inventoryUseCase = inventoryUseCase;
    }

    @Override
    @Transactional
    public PurchaseOrder createOrder(CreatePurchaseCommand command) {
        List<PurchaseOrderDetail> details = command.items().stream()
                .map(item -> PurchaseOrderDetail.create(item.productId(), item.quantity(), item.unitPrice()))
                .toList();

        PurchaseOrder order = PurchaseOrder.create(
                command.supplierId(),
                command.userId(),
                command.branchId(), // Sucursal donde debe llegar
                command.estimatedArrivalDate(),
                details
        );

        return repository.save(order);
    }

    @Override
    @Transactional
    public PurchaseOrder markAsInTransit(Long orderId) {
        PurchaseOrder order = getOrderById(orderId);
        order.markAsInTransit();
        return repository.save(order);
    }

    @Override
    @Transactional
    public PurchaseOrder receiveOrder(Long orderId, Long userId) {
        PurchaseOrder order = getOrderById(orderId);
        order.receive();

        PurchaseOrder savedOrder = repository.save(order);

        // Al recibir validamos el aumento real físico del inventario (Source of truth)
        for (PurchaseOrderDetail detail : savedOrder.getDetails()) {
            inventoryUseCase.addStock(
                    savedOrder.getBranchId(),
                    detail.getProductId(),
                    detail.getQuantity(),
                    MovementReason.COMPRA,
                    userId,
                    savedOrder.getId(),
                    "ORDEN_COMPRA"
            );
        }

        return savedOrder;
    }

    @Override
    public PurchaseOrder getOrderById(Long orderId) {
        return repository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden de compra no encontrada: " + orderId));
    }
}
