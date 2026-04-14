package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.SaleUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleUseCase saleUseCase;

    public SaleController(SaleUseCase saleUseCase) {
        this.saleUseCase = saleUseCase;
    }

    /** POST /api/sales — Registra una nueva venta y descuenta el stock */
    @PostMapping
    public ResponseEntity<Void> registerSale(@Valid @RequestBody SaleRequest request) {
        Long id = saleUseCase.registerSale(request);
        return ResponseEntity.created(URI.create("/api/sales/" + id)).build();
    }

    /** GET /api/sales — Lista todas las ventas con sus detalles */
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAll() {
        return ResponseEntity.ok(saleUseCase.getAllSales());
    }

    /** GET /api/sales/{id} — Detalle completo de una venta */
    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(saleUseCase.getSaleById(id));
    }

    /**
     * GET /api/sales/branch/{branchId}?from=...&to=...
     * Ventas de una sucursal filtradas por rango de fechas (ISO 8601).
     * Ejemplo: ?from=2026-01-01T00:00:00&to=2026-12-31T23:59:59
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<SaleResponse>> getByBranch(
            @PathVariable Long branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(saleUseCase.getSalesByBranch(branchId, from, to));
    }
}
