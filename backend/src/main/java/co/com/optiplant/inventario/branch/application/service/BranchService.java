package co.com.optiplant.inventario.branch.application.service;

import co.com.optiplant.inventario.branch.application.port.in.BranchUseCase;
import co.com.optiplant.inventario.branch.application.port.out.BranchRepositoryPort;
import co.com.optiplant.inventario.branch.domain.model.Branch;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BranchService implements BranchUseCase {

    private final BranchRepositoryPort branchRepositoryPort;

    public BranchService(BranchRepositoryPort branchRepositoryPort) {
        this.branchRepositoryPort = branchRepositoryPort;
    }

    @Override
    public List<Branch> getAllBranches() {
        return branchRepositoryPort.findAll();
    }

    @Override
    public Branch getBranchById(Long id) {
        return branchRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada con ID: " + id));
    }

    @Override
    public Branch createBranch(Branch branch) {
        branch.setActive(true); // Regla: Nace activa
        branch.setCreatedAt(LocalDateTime.now()); // Regla: Fecha del sistema
        return branchRepositoryPort.save(branch);
    }
}