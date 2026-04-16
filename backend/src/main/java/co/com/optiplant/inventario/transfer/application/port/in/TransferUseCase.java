package co.com.optiplant.inventario.transfer.application.port.in;

import co.com.optiplant.inventario.transfer.domain.model.Transfer;
import java.util.List;

public interface TransferUseCase {
    Transfer requestTransfer(RequestTransferCommand command);
    Transfer dispatchTransfer(Long transferId, Long userId);
    Transfer receiveTransfer(Long transferId, ReceiveTransferCommand command);
    Transfer getTransferById(Long transferId);
    List<Transfer> getAllTransfers();
}
