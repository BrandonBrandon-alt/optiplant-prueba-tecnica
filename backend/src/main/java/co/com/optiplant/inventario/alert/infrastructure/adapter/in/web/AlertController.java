package co.com.optiplant.inventario.alert.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.alert.application.port.in.AlertUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertUseCase alertUseCase;

    public AlertController(AlertUseCase alertUseCase) {
        this.alertUseCase = alertUseCase;
    }

    @PostMapping("/scan")
    public ResponseEntity<String> forceScan() {
        alertUseCase.scanForAlerts();
        return ResponseEntity.ok("Escaneo de niveles de stock disparado y completado exitosamente.");
    }

    @GetMapping
    public ResponseEntity<List<StockAlertResponse>> getActiveAlerts(@RequestParam Long branchId) {
        List<StockAlertResponse> responses = alertUseCase.getActiveAlerts(branchId).stream()
                .map(StockAlertResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<String> resolveAlert(@PathVariable Long id) {
        alertUseCase.resolveAlert(id);
        return ResponseEntity.ok("Alerta con ID " + id + " marcada como resuelta.");
    }
}
