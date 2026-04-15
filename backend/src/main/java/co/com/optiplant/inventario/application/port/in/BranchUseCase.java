package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.domain.model.Branch;
import java.util.List;

public interface BranchUseCase {
    List<Branch> getAllBranches();

    Branch getBranchById(Long id);
}