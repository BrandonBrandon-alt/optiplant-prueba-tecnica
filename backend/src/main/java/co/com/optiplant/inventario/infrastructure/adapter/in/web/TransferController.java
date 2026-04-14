package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.TransferUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.TransferRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferUseCase transferUseCase;

    public TransferController(TransferUseCase transferUseCase) {
        this.transferUseCase = transferUseCase;
    }

    /** POST /api/transfers/request — Solicitar transferencia (EN_PREPARACION) */
    @PostMapping("/request")
    public ResponseEntity<Void> requestTransfer(@Valid @RequestBody TransferRequest request) {
        Long id = transferUseCase.requestTransfer(request);
        return ResponseEntity.created(URI.create("/api/transfers/" + id)).build();
    }

    /** PATCH /api/transfers/{id}/dispatch?userId= — Despachar (EN_TRANSITO, descuenta origen) */
    @PatchMapping("/{id}/dispatch")
    public ResponseEntity<Void> dispatch(@PathVariable Long id,
                                         @RequestParam Long userId) {
        transferUseCase.dispatchTransfer(id, userId);
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/transfers/{id}/receive?userId= — Recibir (RECIBIDO, abona destino) */
    @PatchMapping("/{id}/receive")
    public ResponseEntity<Void> receive(@PathVariable Long id,
                                        @RequestParam Long userId) {
        transferUseCase.receiveTransfer(id, userId);
        return ResponseEntity.noContent().build();
    }
}
