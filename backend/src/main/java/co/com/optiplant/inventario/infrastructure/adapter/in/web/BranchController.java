package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.port.in.BranchUseCase;
import co.com.optiplant.inventario.domain.model.Branch;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.BranchResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchUseCase branchUseCase;

    public BranchController(BranchUseCase branchUseCase) {
        this.branchUseCase = branchUseCase;
    }

    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAll() {
        List<Branch> branches = branchUseCase.getAllBranches();

        List<BranchResponse> response = branches.stream()
                .map(branch -> BranchResponse.builder()
                        .id(branch.getId())
                        .nombre(branch.getName()) // Mapeo Inglés -> Español
                        .direccion(branch.getAddress()) // Mapeo Inglés -> Español
                        .telefono(branch.getPhone()) // Mapeo Inglés -> Español
                        .activa(branch.getActive()) // Asumiendo que cambiaste a Boolean en el modelo
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponse> getById(@PathVariable Long id) {
        Branch branch = branchUseCase.getBranchById(id);

        BranchResponse response = BranchResponse.builder()
                .id(branch.getId())
                .nombre(branch.getName())
                .direccion(branch.getAddress())
                .telefono(branch.getPhone())
                .activa(branch.getActive())
                .build();

        return ResponseEntity.ok(response);
    }

}