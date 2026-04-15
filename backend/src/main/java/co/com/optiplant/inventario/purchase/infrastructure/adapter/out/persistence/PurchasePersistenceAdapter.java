package co.com.optiplant.inventario.purchase.infrastructure.adapter.out.persistence;

import co.com.optiplant.inventario.purchase.application.port.out.PurchaseRepositoryPort;
import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrder;
import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrderDetail;
import co.com.optiplant.inventario.purchase.domain.model.PurchaseOrderStatus;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class PurchasePersistenceAdapter implements PurchaseRepositoryPort {

    private final JpaPurchaseRepository repository;

    public PurchasePersistenceAdapter(JpaPurchaseRepository repository) {
        this.repository = repository;
    }

    @Override
    public PurchaseOrder save(PurchaseOrder purchaseOrder) {
        PurchaseOrderEntity entity = toEntity(purchaseOrder);
        PurchaseOrderEntity savedEntity = repository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<PurchaseOrder> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    private PurchaseOrderEntity toEntity(PurchaseOrder domain) {
        PurchaseOrderEntity entity = new PurchaseOrderEntity();
        entity.setId(domain.getId());
        entity.setStatus(domain.getStatus().name());
        entity.setRequestDate(domain.getRequestDate());
        entity.setEstimatedArrivalDate(domain.getEstimatedArrivalDate());
        entity.setSupplierId(domain.getSupplierId());
        entity.setUserId(domain.getUserId());
        entity.setBranchId(domain.getBranchId());

        if (domain.getDetails() != null) {
            for (PurchaseOrderDetail detail : domain.getDetails()) {
                PurchaseDetailEntity detailEntity = new PurchaseDetailEntity();
                detailEntity.setId(detail.getId());
                detailEntity.setProductId(detail.getProductId());
                detailEntity.setQuantity(detail.getQuantity());
                detailEntity.setUnitPrice(detail.getUnitPrice());

                entity.addDetail(detailEntity);
            }
        }
        return entity;
    }

    private PurchaseOrder toDomain(PurchaseOrderEntity entity) {
        return new PurchaseOrder(
                entity.getId(),
                PurchaseOrderStatus.valueOf(entity.getStatus()),
                entity.getRequestDate(),
                entity.getEstimatedArrivalDate(),
                entity.getSupplierId(),
                entity.getUserId(),
                entity.getBranchId(),
                entity.getDetails().stream().map(d -> new PurchaseOrderDetail(
                        d.getId(),
                        d.getProductId(),
                        d.getQuantity(),
                        d.getUnitPrice()
                )).collect(Collectors.toList())
        );
    }
}
