package co.com.optiplant.inventario.transfer.application.port.out;

import co.com.optiplant.inventario.transfer.domain.model.Transfer;

import java.util.Optional;

public interface TransferRepositoryPort {
    Transfer save(Transfer transfer);
    Optional<Transfer> findById(Long id);
}
