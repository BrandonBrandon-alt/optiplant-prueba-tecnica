package co.com.optiplant.inventario.sale.infrastructure.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaSaleRepository extends JpaRepository<SaleEntity, Long> {
}
