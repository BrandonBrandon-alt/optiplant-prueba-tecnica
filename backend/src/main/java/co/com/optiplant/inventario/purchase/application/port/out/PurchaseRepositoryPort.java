package co.com.optiplant.inventario.purchase.application.port.out;

import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrder;

import java.util.Optional;

public interface PurchaseRepositoryPort {
    PurchaseOrder save(PurchaseOrder purchaseOrder);
    Optional<PurchaseOrder> findById(Long id);
}
