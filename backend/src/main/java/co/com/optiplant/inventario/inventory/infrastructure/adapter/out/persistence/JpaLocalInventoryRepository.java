package co.com.optiplant.inventario.inventory.infrastructure.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaLocalInventoryRepository extends JpaRepository<LocalInventoryEntity, Long> {
    Optional<LocalInventoryEntity> findByBranchIdAndProductId(Long branchId, Long productId);

    @Query("SELECT i FROM LocalInventoryEntity i WHERE i.currentQuantity <= i.minimumStock AND i.minimumStock > 0")
    List<LocalInventoryEntity> findLowStock();
}
