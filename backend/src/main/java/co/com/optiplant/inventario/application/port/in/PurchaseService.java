package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.PurchaseRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.PurchaseResponse;

import java.util.List;

/**
 * Puerto de entrada para gestión de órdenes de compra.
 */
public interface PurchaseService {

    Long createPurchaseOrder(PurchaseRequest request);

    void receivePurchaseOrder(Long orderId);

    void cancelPurchaseOrder(Long orderId);

    List<PurchaseResponse> getAllOrders();

    PurchaseResponse getOrderById(Long id);
}