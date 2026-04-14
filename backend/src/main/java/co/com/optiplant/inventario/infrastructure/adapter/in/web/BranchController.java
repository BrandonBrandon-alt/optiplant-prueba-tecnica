package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.BranchUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.BranchResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchUseCase branchUseCase;

    public BranchController(BranchUseCase branchUseCase) {
        this.branchUseCase = branchUseCase;
    }

    /** GET /api/branches — Lista todas las sucursales */
    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAll() {
        return ResponseEntity.ok(branchUseCase.getAllBranches());
    }

    /** GET /api/branches/{id} — Detalle de una sucursal */
    @GetMapping("/{id}")
    public ResponseEntity<BranchResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(branchUseCase.getBranchById(id));
    }
}
