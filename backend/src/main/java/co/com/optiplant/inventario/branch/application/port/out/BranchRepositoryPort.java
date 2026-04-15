package co.com.optiplant.inventario.branch.application.port.out;

import co.com.optiplant.inventario.branch.domain.model.Branch;
import java.util.List;
import java.util.Optional;

public interface BranchRepositoryPort {
    List<Branch> findAll();

    Optional<Branch> findById(Long id);

    Branch save(Branch branch);
}