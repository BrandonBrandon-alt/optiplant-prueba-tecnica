package co.com.optiplant.inventario.alert.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.alert.application.port.in.AlertUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    /** Envelope genérico para respuestas de mensaje — garantiza JSON válido. */
    public record MessageResponse(String message) {}

    private final AlertUseCase alertUseCase;

    public AlertController(AlertUseCase alertUseCase) {
        this.alertUseCase = alertUseCase;
    }

    @PostMapping("/scan")
    public ResponseEntity<MessageResponse> forceScan() {
        alertUseCase.scanForAlerts();
        return ResponseEntity.ok(new MessageResponse("Escaneo de niveles de stock completado exitosamente."));
    }

    @GetMapping
    public ResponseEntity<List<StockAlertResponse>> getActiveAlerts(@RequestParam Long branchId) {
        List<StockAlertResponse> responses = alertUseCase.getActiveAlerts(branchId).stream()
                .map(StockAlertResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<MessageResponse> resolveAlert(@PathVariable Long id) {
        alertUseCase.resolveAlert(id);
        return ResponseEntity.ok(new MessageResponse("Alerta #" + id + " marcada como resuelta."));
    }
}
