package co.com.optiplant.inventario.inventory.infrastructure.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JpaLocalInventoryRepository extends JpaRepository<LocalInventoryEntity, Long> {
    Optional<LocalInventoryEntity> findByBranchIdAndProductId(Long branchId, Long productId);
}
