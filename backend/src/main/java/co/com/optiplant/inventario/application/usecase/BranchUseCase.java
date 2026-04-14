package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.BranchResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.BranchEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BranchUseCase {

    private final BranchRepository branchRepository;

    public BranchUseCase(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @Transactional(readOnly = true)
    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BranchResponse getBranchById(Long id) {
        BranchEntity branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", id));
        return mapToResponse(branch);
    }

    private BranchResponse mapToResponse(BranchEntity entity) {
        return BranchResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .direccion(entity.getDireccion())
                .telefono(entity.getTelefono())
                .activa(entity.isActiva())
                .build();
    }
}
