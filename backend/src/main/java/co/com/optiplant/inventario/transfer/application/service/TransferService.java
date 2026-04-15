package co.com.optiplant.inventario.transfer.application.service;

import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.domain.model.MovementReason;
import co.com.optiplant.inventario.transfer.application.port.in.ReceiveTransferCommand;
import co.com.optiplant.inventario.transfer.application.port.in.RequestTransferCommand;
import co.com.optiplant.inventario.transfer.application.port.in.TransferUseCase;
import co.com.optiplant.inventario.transfer.application.port.out.TransferRepositoryPort;
import co.com.optiplant.inventario.transfer.domain.model.Transfer;
import co.com.optiplant.inventario.transfer.domain.model.TransferDetail;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransferService implements TransferUseCase {

    private final TransferRepositoryPort transferRepositoryPort;
    private final InventoryUseCase inventoryUseCase;

    public TransferService(TransferRepositoryPort transferRepositoryPort, InventoryUseCase inventoryUseCase) {
        this.transferRepositoryPort = transferRepositoryPort;
        this.inventoryUseCase = inventoryUseCase;
    }

    @Override
    @Transactional
    public Transfer requestTransfer(RequestTransferCommand command) {
        List<TransferDetail> details = command.items().stream()
                .map(item -> TransferDetail.create(item.productId(), item.requestedQuantity()))
                .toList();

        Transfer transfer = Transfer.create(
                command.originBranchId(),
                command.destinationBranchId(),
                command.estimatedArrivalDate(),
                details
        );

        return transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public Transfer dispatchTransfer(Long transferId, Long userId) {
        Transfer transfer = getTransferById(transferId);
        
        // El agregado valida su estado internamente
        transfer.dispatch();

        // Almacenamos el avance local del estado transaccional
        Transfer savedTransfer = transferRepositoryPort.save(transfer);

        // Operamos contra el Inventario de la sucursal origen
        for (TransferDetail detail : savedTransfer.getDetails()) {
            detail.registerDispatch(detail.getRequestedQuantity()); // Se envia lo validado
            
            inventoryUseCase.withdrawStock(
                    savedTransfer.getOriginBranchId(),
                    detail.getProductId(),
                    BigDecimal.valueOf(detail.getSentQuantity()),
                    MovementReason.TRASLADO,
                    userId,
                    savedTransfer.getId(),
                    "TRANSFERENCIA_OUT"
            );
        }

        return transferRepositoryPort.save(savedTransfer);
    }

    @Override
    @Transactional
    public Transfer receiveTransfer(Long transferId, ReceiveTransferCommand command) {
        Transfer transfer = getTransferById(transferId);
        transfer.receive();

        // Procesar detalles
        for (ReceiveTransferCommand.ReceivedDetail rDetail : command.items()) {
            TransferDetail detail = transfer.getDetails().stream()
                    .filter(d -> d.getId().equals(rDetail.detailId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró el detalle en esta transferencia."));
            
            detail.registerReceipt(rDetail.receivedQuantity());
            
            // Si llego mayor a cero, ingresar físicamente a la sucursal de destino
            if (detail.getReceivedQuantity() > 0) {
                inventoryUseCase.addStock(
                        transfer.getDestinationBranchId(),
                        detail.getProductId(),
                        BigDecimal.valueOf(detail.getReceivedQuantity()),
                        MovementReason.TRASLADO,
                        command.userId(),
                        transfer.getId(),
                        "TRANSFERENCIA_IN"
                );
            }
        }

        return transferRepositoryPort.save(transfer);
    }

    @Override
    public Transfer getTransferById(Long id) {
        return transferRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transferencia no encontrada con id: " + id));
    }
}
