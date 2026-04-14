package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.TransferUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.TransferRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferUseCase transferUseCase;

    public TransferController(TransferUseCase transferUseCase) {
        this.transferUseCase = transferUseCase;
    }

    @PostMapping("/request")
    public ResponseEntity<String> requestTransfer(@Valid @RequestBody TransferRequest request) {
        Long id = transferUseCase.requestTransfer(request);
        return ResponseEntity.ok("Solicitud de transferencia generada exitosamente con ID: " + id);
    }
}
