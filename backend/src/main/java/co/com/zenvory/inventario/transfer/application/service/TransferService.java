package co.com.zenvory.inventario.transfer.application.service;

import co.com.zenvory.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.zenvory.inventario.inventory.domain.model.MovementReason;
import co.com.zenvory.inventario.catalog.application.port.in.ProductUseCase;
import co.com.zenvory.inventario.transfer.application.port.in.DispatchTransferCommand;
import co.com.zenvory.inventario.transfer.application.port.in.ReceiveTransferCommand;
import co.com.zenvory.inventario.transfer.application.port.in.RequestTransferCommand;
import co.com.zenvory.inventario.transfer.application.port.in.TransferUseCase;
import co.com.zenvory.inventario.transfer.application.port.out.TransferRepositoryPort;
import co.com.zenvory.inventario.transfer.domain.model.Transfer;
import java.util.List;
import co.com.zenvory.inventario.transfer.domain.model.TransferDetail;
import co.com.zenvory.inventario.transfer.domain.model.TransferStatus;
import co.com.zenvory.inventario.transfer.application.port.in.UpdateQuantityCommand;
import co.com.zenvory.inventario.alert.application.port.in.AlertUseCase;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import co.com.zenvory.inventario.auth.application.port.out.UserRepositoryPort;
import co.com.zenvory.inventario.auth.domain.model.User;

@Service
public class TransferService implements TransferUseCase {

    private final TransferRepositoryPort transferRepositoryPort;
    private final InventoryUseCase inventoryUseCase;
    private final ProductUseCase productUseCase;
    private final AlertUseCase alertUseCase;
    private final UserRepositoryPort userRepositoryPort;

    public TransferService(TransferRepositoryPort transferRepositoryPort, 
                           InventoryUseCase inventoryUseCase, 
                           ProductUseCase productUseCase,
                           @Lazy AlertUseCase alertUseCase,
                           UserRepositoryPort userRepositoryPort) {
        this.transferRepositoryPort = transferRepositoryPort;
        this.inventoryUseCase = inventoryUseCase;
        this.productUseCase = productUseCase;
        this.alertUseCase = alertUseCase;
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    @Transactional
    public Transfer requestTransfer(RequestTransferCommand command) {
        List<TransferDetail> details = command.items().stream()
                .map(item -> {
                    String productName = productUseCase.getProductById(item.productId()).getName();
                    return TransferDetail.create(item.productId(), productName, item.requestedQuantity());
                })
                .toList();

        Transfer transfer = Transfer.create(
                command.originBranchId(),
                command.destinationBranchId(),
                command.estimatedArrivalDate(),
                details,
                command.priority() != null ? command.priority() : co.com.zenvory.inventario.transfer.domain.model.TransferPriority.NORMAL
        );

        // SENIOR DIRECTIVE: Auto-Approval for Managers
        User user = userRepositoryPort.findById(command.userId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        if (user.getRole() != null && "MANAGER".equals(user.getRole().getNombre())) {
            transfer.approveDestination();
        }

        // REGLA DE NEGOCIO: Reservar stock en la sucursal de origen
        for (TransferDetail detail : details) {
            inventoryUseCase.reserveStock(
                    transfer.getOriginBranchId(),
                    detail.getProductId(),
                    BigDecimal.valueOf(detail.getRequestedQuantity())
            );
        }

        return transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public Transfer approveDestination(Long id) {
        Transfer transfer = getTransferById(id);
        transfer.approveDestination();
        return transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public Transfer dispatchTransfer(Long transferId, DispatchTransferCommand command) {
        Transfer transfer = getTransferById(transferId);
        
        // El agregado valida su estado internamente
        transfer.dispatch(command.carrier(), java.math.BigDecimal.ZERO, null); // Setting defaults until command is updated

        // Operamos contra el Inventario de la sucursal origen
        for (DispatchTransferCommand.DispatchDetail dDetail : command.items()) {
            TransferDetail detail = transfer.getDetails().stream()
                    .filter(d -> d.getId().equals(dDetail.detailId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró el detalle en esta transferencia."));
            
            detail.registerDispatch(dDetail.sentQuantity());
            
            String productName = productUseCase.getProductById(detail.getProductId()).getName();
            
            inventoryUseCase.withdrawStock(
                    transfer.getOriginBranchId(),
                    detail.getProductId(),
                    productName,
                    BigDecimal.valueOf(detail.getSentQuantity()),
                    null,
                    MovementReason.TRASLADO,
                    command.userId(),
                    transfer.getId(),
                    "TRANSFERENCIA_OUT",
                    null,
                    null
            );

            // REGLA DE NEGOCIO: Liberar el stock comprometido que ya se retiró físicamente
            // NOTA: Liberamos la cantidad original solicitada que fue reservada
            inventoryUseCase.releaseStock(
                    transfer.getOriginBranchId(),
                    detail.getProductId(),
                    BigDecimal.valueOf(detail.getRequestedQuantity())
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
                        null,
                        MovementReason.TRASLADO,
                        command.userId(),
                        transfer.getId(),
                        "TRANSFERENCIA_IN",
                        null,
                        command.notes(),
                        null
                );
            }
        }

        transfer.receive(command.notes(), hasIssues);

        return transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public void cancelTransfer(Long id, String reason, Long userId) {
        Transfer transfer = getTransferById(id);
        TransferStatus previousStatus = transfer.getStatus();
        
        transfer.cancel(reason, userId);

        // Si ya estaba en tránsito, re-ingresar el stock al origen (Devolución por cancelación)
        if (previousStatus == TransferStatus.IN_TRANSIT) {
            for (TransferDetail detail : transfer.getDetails()) {
                if (detail.getSentQuantity() != null && detail.getSentQuantity() > 0) {
                    inventoryUseCase.addStock(
                            transfer.getOriginBranchId(),
                            detail.getProductId(),
                            BigDecimal.valueOf(detail.getSentQuantity()),
                            null, // unitId
                            MovementReason.DEVOLUCION,
                            userId,
                            transfer.getId(),
                            "TRASLADO_ANULADO_TRANSITO",
                            null, // unitCost
                            reason, 
                            null
                    );
                }
            }
        } 
        // Si no se había despachado, liberar el stock comprometido
        else {
            for (TransferDetail detail : transfer.getDetails()) {
                inventoryUseCase.releaseStock(
                        transfer.getOriginBranchId(),
                        detail.getProductId(),
                        BigDecimal.valueOf(detail.getRequestedQuantity())
                );
            }
        }

        transferRepositoryPort.save(transfer);
    }

    @Override
    @Transactional
    public void rejectTransfer(Long id, String reason, Long userId) {
        Transfer transfer = getTransferById(id);
        TransferStatus previousStatus = transfer.getStatus();
        
        transfer.reject(reason, userId);

        // Si ya estaba en tránsito, el rechazo implica que la mercancía vuelve al origen
        if (previousStatus == TransferStatus.IN_TRANSIT) {
            for (TransferDetail detail : transfer.getDetails()) {
                if (detail.getSentQuantity() != null && detail.getSentQuantity() > 0) {
                    inventoryUseCase.addStock(
                            transfer.getOriginBranchId(),
                            detail.getProductId(),
                            BigDecimal.valueOf(detail.getSentQuantity()),
                            null, // unitId
                            MovementReason.DEVOLUCION,
                            userId,
                            transfer.getId(),
                            "TRASLADO_RECHAZADO_TRANSITO",
                            null, // unitCost
                            reason, 
                            null
                    );
                }
            }
        } 
        // Si se rechazó antes de salir, solo liberamos reserva
        else {
            for (TransferDetail detail : transfer.getDetails()) {
                inventoryUseCase.releaseStock(
                        transfer.getOriginBranchId(),
                        detail.getProductId(),
                        BigDecimal.valueOf(detail.getRequestedQuantity())
                );
            }
        }

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
                .map(d -> TransferDetail.create(d.getProductId(), d.getProductName(), d.getMissingQuantity()))
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

    @Override
    public co.com.zenvory.inventario.transfer.infrastructure.adapter.in.web.TransferFulfillmentReport getFulfillmentReport() {
        List<Transfer> transfers = transferRepositoryPort.findAll();
        
        long totalTransfers = transfers.size();
        
        List<Transfer> delivered = transfers.stream()
            .filter(t -> t.getStatus() == TransferStatus.DELIVERED)
            .toList();
            
        long totalDelivered = delivered.size();
        
        long delayedCount = 0;
        double totalDelayHours = 0.0;
        
        for (Transfer t : delivered) {
            if (t.getEstimatedArrivalDate() != null && t.getActualArrivalDate() != null) {
                if (t.getActualArrivalDate().isAfter(t.getEstimatedArrivalDate())) {
                    delayedCount++;
                    java.time.Duration duration = java.time.Duration.between(t.getEstimatedArrivalDate(), t.getActualArrivalDate());
                    totalDelayHours += duration.toHours();
                }
            }
        }
        
        double onTimePercentage = totalDelivered > 0 ? ((double) (totalDelivered - delayedCount) / totalDelivered) * 100.0 : 0.0;
        double averageDelayHours = delayedCount > 0 ? totalDelayHours / delayedCount : 0.0;
        
        return new co.com.zenvory.inventario.transfer.infrastructure.adapter.in.web.TransferFulfillmentReport(
            totalTransfers,
            totalDelivered,
            delayedCount,
            onTimePercentage,
            averageDelayHours
        );
    }
}
