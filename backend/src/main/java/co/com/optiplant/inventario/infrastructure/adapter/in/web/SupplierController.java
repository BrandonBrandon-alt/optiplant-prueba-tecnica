package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.SupplierUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SupplierResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierUseCase supplierUseCase;

    public SupplierController(SupplierUseCase supplierUseCase) {
        this.supplierUseCase = supplierUseCase;
    }

    /** GET /api/suppliers — Lista todos los proveedores */
    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAll() {
        return ResponseEntity.ok(supplierUseCase.getAllSuppliers());
    }

    /** GET /api/suppliers/{id} — Detalle de un proveedor */
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierUseCase.getSupplierById(id));
    }
}
