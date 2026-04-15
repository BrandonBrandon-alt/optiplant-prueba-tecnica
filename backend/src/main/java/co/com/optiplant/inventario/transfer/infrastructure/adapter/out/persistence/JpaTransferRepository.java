package co.com.optiplant.inventario.transfer.infrastructure.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaTransferRepository extends JpaRepository<TransferEntity, Long> {
}
