package co.com.optiplant.inventario.alert.application.service;

import co.com.optiplant.inventario.alert.application.port.in.AlertUseCase;
import co.com.optiplant.inventario.alert.application.port.out.AlertRepositoryPort;
import co.com.optiplant.inventario.alert.domain.model.StockAlert;
import co.com.optiplant.inventario.branch.application.port.in.BranchUseCase;
import co.com.optiplant.inventario.branch.domain.model.Branch;
import co.com.optiplant.inventario.catalog.application.port.in.ProductUseCase;
import co.com.optiplant.inventario.catalog.domain.model.Product;
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
    private final ProductUseCase productUseCase;
    private final BranchUseCase branchUseCase;

    public AlertService(AlertRepositoryPort alertRepository, 
                        InventoryUseCase inventoryUseCase,
                        ProductUseCase productUseCase,
                        BranchUseCase branchUseCase) {
        this.alertRepository = alertRepository;
        this.inventoryUseCase = inventoryUseCase;
        this.productUseCase = productUseCase;
        this.branchUseCase = branchUseCase;
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
            handleLowStockCheck(inv);
        }
    }

    @Transactional
    public void handleLowStockCheck(LocalInventory inv) {
        if (inv.getCurrentQuantity().compareTo(inv.getMinimumStock()) <= 0 && inv.getMinimumStock().compareTo(java.math.BigDecimal.ZERO) > 0) {
            // Verificar si ya hay alerta activa para no causar spam.
            List<StockAlert> unresolves = alertRepository.findUnresolvedByBranchAndProduct(inv.getBranchId(),
                    inv.getProductId());
            if (unresolves.isEmpty()) {
                String actual = inv.getCurrentQuantity().stripTrailingZeros().toPlainString();
                String minimo = inv.getMinimumStock().stripTrailingZeros().toPlainString();
                
                // Obtener nombres para el mensaje descriptivo
                Product product = productUseCase.getProductById(inv.getProductId());
                Branch branch = branchUseCase.getBranchById(inv.getBranchId());
                String unidad = product.getUnit() != null ? product.getUnit().name() : "UND";

                String msg = String.format("⚠ Stock crítico en %s: %s tiene solo %s %s (Mínimo: %s)",
                        branch.getName(), product.getName(), actual, unidad, minimo);

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
