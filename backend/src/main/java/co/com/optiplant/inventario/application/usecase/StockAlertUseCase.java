package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.StockAlertResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.BranchEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.LocalInventoryEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.StockAlertEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.StockAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockAlertUseCase {

    private final StockAlertRepository stockAlertRepository;

    public StockAlertUseCase(StockAlertRepository stockAlertRepository) {
        this.stockAlertRepository = stockAlertRepository;
    }

    /**
     * Evalúa si el stock actual de un producto en una sucursal rompió el umbral
     * mínimo y, de ser así, persiste una nueva alerta en la base de datos.
     * Este método es llamado internamente por InventoryUseCase tras cada movimiento.
     */
    @Transactional
    public void evaluateAndCreate(LocalInventoryEntity localInventory) {
        if (localInventory.getCantidadActual().compareTo(localInventory.getStockMinimo()) < 0) {
            BranchEntity branch = localInventory.getSucursal();
            ProductEntity product = localInventory.getProducto();

            String mensaje = String.format(
                    "ALERTA: El producto '%s' en la sucursal '%s' tiene stock actual de %s, por debajo del mínimo de %s.",
                    product.getNombre(),
                    branch.getNombre(),
                    localInventory.getCantidadActual().toPlainString(),
                    localInventory.getStockMinimo().toPlainString()
            );

            StockAlertEntity alert = StockAlertEntity.builder()
                    .sucursal(branch)
                    .producto(product)
                    .mensaje(mensaje)
                    .resuelta(false)
                    .build();

            stockAlertRepository.save(alert);
        }
    }

    /**
     * Marca una alerta como resuelta (el operador confirmó que repuso el stock).
     */
    @Transactional
    public void resolveAlert(Long alertId) {
        StockAlertEntity alert = stockAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta", "ID", alertId));
        alert.setResuelta(true);
        stockAlertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public List<StockAlertResponse> getPendingAlerts() {
        return stockAlertRepository.findByResuelta(false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StockAlertResponse> getAlertsByBranch(Long branchId) {
        return stockAlertRepository.findBySucursalId(branchId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StockAlertResponse mapToResponse(StockAlertEntity entity) {
        return StockAlertResponse.builder()
                .id(entity.getId())
                .sucursalId(entity.getSucursal().getId())
                .sucursalNombre(entity.getSucursal().getNombre())
                .productoId(entity.getProducto().getId())
                .productoNombre(entity.getProducto().getNombre())
                .mensaje(entity.getMensaje())
                .fechaAlerta(entity.getFechaAlerta())
                .resuelta(entity.getResuelta())
                .build();
    }
}
