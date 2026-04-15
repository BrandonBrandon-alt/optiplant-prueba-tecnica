package co.com.optiplant.inventario.purchase.infrastructure.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaPurchaseRepository extends JpaRepository<PurchaseOrderEntity, Long> {
}
