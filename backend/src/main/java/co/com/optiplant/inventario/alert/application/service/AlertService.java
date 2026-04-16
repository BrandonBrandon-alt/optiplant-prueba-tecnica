package co.com.optiplant.inventario.alert.application.service;

import co.com.optiplant.inventario.alert.application.port.in.AlertUseCase;
import co.com.optiplant.inventario.alert.application.port.out.AlertRepositoryPort;
import co.com.optiplant.inventario.alert.domain.model.StockAlert;
import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.domain.model.LocalInventory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertService implements AlertUseCase {

    private final AlertRepositoryPort alertRepository;
    private final InventoryUseCase inventoryUseCase;

    public AlertService(AlertRepositoryPort alertRepository, InventoryUseCase inventoryUseCase) {
        this.alertRepository = alertRepository;
        this.inventoryUseCase = inventoryUseCase;
    }

    /**
     * Engine Manager. Se ejecuta en background automáticamente.
     * fixedDelay = 3600000ms = 1 Hora
     */
    @Override
    @Transactional
    @Scheduled(fixedDelayString = "3600000")
    public void scanForAlerts() {
        List<LocalInventory> lowStockInventories = inventoryUseCase.getLowStockInventories();

        for (LocalInventory inv : lowStockInventories) {
            // Verificar si ya hay alerta activa para no causar spam.
            List<StockAlert> unresolves = alertRepository.findUnresolvedByBranchAndProduct(inv.getBranchId(),
                    inv.getProductId());
            if (unresolves.isEmpty()) {
                String actual = inv.getCurrentQuantity().stripTrailingZeros().toPlainString();
                String minimo = inv.getMinimumStock().stripTrailingZeros().toPlainString();
                String msg = String.format("⚠ Stock crítico: %s tiene solo %s unidades (mínimo: %s) en Sucursal #%d",
                        "Producto #" + inv.getProductId(), actual, minimo, inv.getBranchId());

                StockAlert alert = StockAlert.create(inv.getBranchId(), inv.getProductId(), msg);
                alertRepository.save(alert);
            }
        }
    }

    @Override
    @Transactional
    public void createAlert(Long branchId, Long productId, String message) {
        StockAlert alert = StockAlert.create(branchId, productId, message);
        alertRepository.save(alert);
    }

    @Override
    public List<StockAlert> getActiveAlerts(Long branchId) {
        return alertRepository.findActiveAlerts(branchId);
    }

    @Override
    @Transactional
    public void resolveAlert(Long alertId) {
        StockAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la alerta de stock solicitada."));
        alert.resolve();
        alertRepository.save(alert);
    }
}
