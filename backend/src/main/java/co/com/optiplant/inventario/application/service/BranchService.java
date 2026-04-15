package co.com.optiplant.inventario.application.service;

import co.com.optiplant.inventario.application.port.in.BranchUseCase;
import co.com.optiplant.inventario.application.port.out.BranchRepositoryPort;
import co.com.optiplant.inventario.domain.model.Branch;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BranchService implements BranchUseCase {

    // Inyectamos la INTERFAZ (Puerto), NO el repositorio de Spring Data directo
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
        // Aquí iría tu lógica de negocio (ej. lanzar excepción si no existe)
        return branchRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada con ID: " + id));
    }
}