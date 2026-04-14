package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.enums.TransferState;
import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.TransferRequest;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.BranchEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.TransferDetailEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.TransferEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.BranchRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.ProductRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.TransferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class TransferUseCase {

    private final TransferRepository transferRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;
    private final InventoryUseCase inventoryUseCase;

    public TransferUseCase(TransferRepository transferRepository,
                           BranchRepository branchRepository,
                           ProductRepository productRepository,
                           InventoryUseCase inventoryUseCase) {
        this.transferRepository = transferRepository;
        this.branchRepository = branchRepository;
        this.productRepository = productRepository;
        this.inventoryUseCase = inventoryUseCase;
    }

    /** Crea la transferencia en estado EN_PREPARACION sin afectar inventario todavía. */
    @Transactional
    public Long requestTransfer(TransferRequest request) {
        BranchEntity origin = branchRepository.findById(request.getOriginBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getOriginBranchId()));

        BranchEntity dest = branchRepository.findById(request.getDestinationBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getDestinationBranchId()));

        TransferEntity transfer = TransferEntity.builder()
                .sucursalOrigen(origin)
                .sucursalDestino(dest)
                .estado(TransferState.EN_PREPARACION)
                .fechaEstimadaLlegada(request.getEstimatedArrival())
                .build();

        for (TransferRequest.TransferItem item : request.getItems()) {
            ProductEntity product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", "ID", item.getProductId()));

            TransferDetailEntity detail = TransferDetailEntity.builder()
                    .producto(product)
                    .cantidadSolicitada(item.getQuantity())
                    .build();

            transfer.addDetalle(detail);
        }

        return transferRepository.save(transfer).getId();
    }

    /**
     * Despacha la transferencia: cambia a EN_TRANSITO y descuenta el inventario
     * de la sucursal origen usando el kardex de InventoryUseCase.
     */
    @Transactional
    public void dispatchTransfer(Long transferId, Long responsibleUserId) {
        TransferEntity transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transferencia", "ID", transferId));

        if (transfer.getEstado() != TransferState.EN_PREPARACION) {
            throw new IllegalStateException("Solo se pueden despachar transferencias EN_PREPARACION. Estado actual: " + transfer.getEstado());
        }

        Long originBranchId = transfer.getSucursalOrigen().getId();

        for (TransferDetailEntity detail : transfer.getDetalles()) {
            InventoryMovementRequest movement = InventoryMovementRequest.builder()
                    .branchId(originBranchId)
                    .productId(detail.getProducto().getId())
                    .userId(responsibleUserId)
                    .type("RETIRO")
                    .reason("TRASLADO")
                    .quantity(new BigDecimal(detail.getCantidadSolicitada()))
                    .referenceId(transfer.getId())
                    .referenceType("TRANSFERENCIA")
                    .build();

            inventoryUseCase.registerMovement(movement);
            detail.setCantidadEnviada(detail.getCantidadSolicitada());
        }

        transfer.setEstado(TransferState.EN_TRANSITO);
        transferRepository.save(transfer);
    }

    /**
     * Recepción en destino: cambia a RECIBIDO, registra la fecha real
     * y abona el inventario en la sucursal destino.
     */
    @Transactional
    public void receiveTransfer(Long transferId, Long responsibleUserId) {
        TransferEntity transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transferencia", "ID", transferId));

        if (transfer.getEstado() != TransferState.EN_TRANSITO) {
            throw new IllegalStateException("Solo se pueden recibir transferencias EN_TRANSITO. Estado actual: " + transfer.getEstado());
        }

        Long destBranchId = transfer.getSucursalDestino().getId();

        for (TransferDetailEntity detail : transfer.getDetalles()) {
            int cantidadRecibida = detail.getCantidadEnviada();
            int faltantes = detail.getCantidadSolicitada() - cantidadRecibida;

            detail.setCantidadRecibida(cantidadRecibida);
            detail.setFaltantes(faltantes);

            InventoryMovementRequest movement = InventoryMovementRequest.builder()
                    .branchId(destBranchId)
                    .productId(detail.getProducto().getId())
                    .userId(responsibleUserId)
                    .type("INGRESO")
                    .reason("TRASLADO")
                    .quantity(new BigDecimal(cantidadRecibida))
                    .referenceId(transfer.getId())
                    .referenceType("TRANSFERENCIA")
                    .build();

            inventoryUseCase.registerMovement(movement);
        }

        transfer.setEstado(TransferState.RECIBIDO);
        transfer.setFechaRealLlegada(LocalDateTime.now());
        transferRepository.save(transfer);
    }
}
