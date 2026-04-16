package co.com.optiplant.inventario.sale.application.port.out;

import co.com.optiplant.inventario.sale.domain.model.Sale;

import java.util.List;
import java.util.Optional;

public interface SaleRepositoryPort {
    Sale save(Sale sale);
    Optional<Sale> findById(Long id);
    List<Sale> findAll();
    List<Sale> findByBranchId(Long branchId);
}
