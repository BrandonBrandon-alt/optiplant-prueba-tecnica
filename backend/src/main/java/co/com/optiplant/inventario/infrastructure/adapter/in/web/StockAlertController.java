package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.StockAlertUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.StockAlertResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class StockAlertController {

    private final StockAlertUseCase stockAlertUseCase;

    public StockAlertController(StockAlertUseCase stockAlertUseCase) {
        this.stockAlertUseCase = stockAlertUseCase;
    }

    /** GET /api/alerts — Lista todas las alertas pendientes (no resueltas) */
    @GetMapping
    public ResponseEntity<List<StockAlertResponse>> getPending() {
        return ResponseEntity.ok(stockAlertUseCase.getPendingAlerts());
    }

    /** GET /api/alerts/branch/{branchId} — Alertas por sucursal */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<StockAlertResponse>> getByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(stockAlertUseCase.getAlertsByBranch(branchId));
    }

    /** PATCH /api/alerts/{id}/resolve — Marcar una alerta como resuelta */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Void> resolve(@PathVariable Long id) {
        stockAlertUseCase.resolveAlert(id);
        return ResponseEntity.noContent().build();
    }
}
