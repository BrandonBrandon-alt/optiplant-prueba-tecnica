package co.com.optiplant.inventario.alert.application.port.in;

import co.com.optiplant.inventario.alert.domain.model.StockAlert;

import co.com.optiplant.inventario.inventory.domain.model.LocalInventory;
import java.util.List;

public interface AlertUseCase {
    void scanForAlerts();
    void handleLowStockCheck(LocalInventory inv);
    void createAlert(Long branchId, Long productId, String message);
    List<StockAlert> getActiveAlerts(Long branchId);
    void resolveAlert(Long alertId);
}
