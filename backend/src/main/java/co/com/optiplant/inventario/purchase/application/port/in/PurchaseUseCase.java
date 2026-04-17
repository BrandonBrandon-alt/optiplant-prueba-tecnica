package co.com.optiplant.inventario.purchase.application.port.in;

import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrder;

import java.util.List;

public interface PurchaseUseCase {
    PurchaseOrder createOrder(CreatePurchaseCommand command);
    PurchaseOrder markAsInTransit(Long orderId);
    PurchaseOrder receiveOrder(Long orderId, Long userId);
    PurchaseOrder getOrderById(Long orderId);
    List<PurchaseOrder> getAllOrders();
}
