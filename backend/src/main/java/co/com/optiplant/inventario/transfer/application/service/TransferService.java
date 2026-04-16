package co.com.optiplant.inventario.transfer.application.service;

import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.domain.model.MovementReason;
import co.com.optiplant.inventario.transfer.application.port.in.DispatchTransferCommand;
import co.com.optiplant.inventario.transfer.application.port.in.ReceiveTransferCommand;
import co.com.optiplant.inventario.transfer.application.port.in.RequestTransferCommand;
import co.com.optiplant.inventario.transfer.application.port.in.TransferUseCase;
import co.com.optiplant.inventario.transfer.application.port.out.TransferRepositoryPort;
import co.com.optiplant.inventario.transfer.domain.model.Transfer;
import java.util.List;
import co.com.optiplant.inventario.transfer.domain.model.TransferDetail;
import co.com.optiplant.inventario.transfer.application.port.in.UpdateQuantityCommand;
import co.com.optiplant.inventario.alert.application.port.in.AlertUseCase;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransferService implements TransferUseCase {

    private final TransferRepositoryPort transferRepositoryPort;
    private final InventoryUseCase inventoryUseCase;
    private final AlertUseCase alertUseCase;

    public TransferService(TransferRepositoryPort transferRepositoryPort, 
                           InventoryUseCase inventoryUseCase, 
                           @Lazy AlertUseCase alertUseCase) {
        this.transferRepositoryPort = transferRepositoryPort;
        this.inventoryUseCase = inventoryUseCase;
        this.alertUseCase = alertUseCase;
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
    public Transfer dispatchTransfer(Long transferId, DispatchTransferCommand command) {
        Transfer transfer = getTransferById(transferId);
        
        // El agregado valida su estado internamente
        transfer.dispatch(command.carrier());

        // Operamos contra el Inventario de la sucursal origen
        for (DispatchTransferCommand.DispatchDetail dDetail : command.items()) {
            TransferDetail detail = transfer.getDetails().stream()
                    .filter(d -> d.getId().equals(dDetail.detailId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró el detalle en esta transferencia."));
            
            detail.registerDispatch(dDetail.sentQuantity());
            
            inventoryUseCase.withdrawStock(
                    transfer.getOriginBranchId(),
                    detail.getProductId(),
                    BigDecimal.valueOf(detail.getSentQuantity()),
                    MovementReason.TRASLADO,
                    command.userId(),
                    transfer.getId(),
                    "TRANSFERENCIA_OUT"
            );
        }

        return transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public Transfer prepareTransfer(Long transferId, List<UpdateQuantityCommand> items) {
        Transfer transfer = getTransferById(transferId);
        transfer.prepare();

        // En la preparación, el administrador podría ajustar cantidades solicitadas.
        // Por sencillez en esta fase, solo pasamos a estado PREPARING.
        
        return transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public Transfer receiveTransfer(Long transferId, ReceiveTransferCommand command) {
        Transfer transfer = getTransferById(transferId);
        
        boolean hasIssues = false;

        // Procesar detalles primero para calcular si hay novedades
        for (ReceiveTransferCommand.ReceivedDetail rDetail : command.items()) {
            TransferDetail detail = transfer.getDetails().stream()
                    .filter(d -> d.getId().equals(rDetail.detailId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró el detalle en esta transferencia."));
            
            detail.registerReceipt(rDetail.receivedQuantity());
            if (detail.getMissingQuantity() > 0) {
                hasIssues = true;
                String msg = String.format("Novedad en Traslado #%d: Faltan %d unidades del producto #%d en destino", 
                        transfer.getId(), detail.getMissingQuantity(), detail.getProductId());
                alertUseCase.createAlert(transfer.getDestinationBranchId(), detail.getProductId(), msg);
            }
            
            // Si llego mayor a cero, ingresar físicamente a la sucursal de destino
            if (detail.getReceivedQuantity() > 0) {
                inventoryUseCase.addStock(
                        transfer.getDestinationBranchId(),
                        detail.getProductId(),
                        BigDecimal.valueOf(detail.getReceivedQuantity()),
                        MovementReason.TRASLADO,
                        command.userId(),
                        transfer.getId(),
                        "TRANSFERENCIA_IN",
                        null
                );
            }
        }

        transfer.receive(command.notes(), hasIssues);

        return transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public void cancelTransfer(Long id) {
        Transfer transfer = getTransferById(id);
        transfer.cancel();
        transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public void resolveAsShrinkage(Long id) {
        Transfer transfer = getTransferById(id);
        transfer.resolveAsShrinkage();
        transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public void resolveAsResend(Long id) {
        Transfer transfer = getTransferById(id);
        
        // Crear nuevo traslado para los faltantes
        List<TransferDetail> relativeDetails = transfer.getDetails().stream()
                .filter(d -> d.getMissingQuantity() > 0)
                .map(d -> TransferDetail.create(d.getProductId(), d.getMissingQuantity()))
                .toList();
        
        if (!relativeDetails.isEmpty()) {
            Transfer resend = Transfer.resend(transfer, relativeDetails);
            transferRepositoryPort.save(resend);
        }
        
        // El original queda como DELIVERED (o cerramos el ciclo)
        transfer.resolveAsShrinkage(); // Lo marcamos como resuelto
        transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public void resolveAsClaim(Long id) {
        Transfer transfer = getTransferById(id);
        transfer.resolveAsClaim();
        transferRepositoryPort.save(transfer);
    }

    @Override
    public Transfer getTransferById(Long id) {
        return transferRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transferencia no encontrada con id: " + id));
    }

    @Override
    public List<Transfer> getAllTransfers() {
        return transferRepositoryPort.findAll();
    }
}
