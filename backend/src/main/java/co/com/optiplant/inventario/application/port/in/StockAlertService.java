package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.domain.model.LocalInventory;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.StockAlertResponse;

import java.util.List;

/**
 * Puerto de entrada para alertas de stock mínimo.
 */
public interface StockAlertService {

    /** Evaluado internamente por InventoryUseCase tras cada movimiento. */
    void evaluateAndCreate(LocalInventory localInventory);

    void resolveAlert(Long alertId);

    List<StockAlertResponse> getPendingAlerts();

    List<StockAlertResponse> getAlertsByBranch(Long branchId);
}