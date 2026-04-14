package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.enums.TransferState;
import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
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

@Service
public class TransferUseCase {

    private final TransferRepository transferRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;

    public TransferUseCase(TransferRepository transferRepository,
                           BranchRepository branchRepository,
                           ProductRepository productRepository) {
        this.transferRepository = transferRepository;
        this.branchRepository = branchRepository;
        this.productRepository = productRepository;
    }

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

        TransferEntity savedTransfer = transferRepository.save(transfer);
        
        // TODO: En los siguientes flujos de estado (EN_TRANSITO, RECIBIDO), 
        // se llamaría a InventoryUseCase para afectar los saldos físicos.
        return savedTransfer.getId();
    }
}
