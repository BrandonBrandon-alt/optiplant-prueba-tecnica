package co.com.optiplant.inventario.sale.infrastructure.adapter.out.persistence;

import co.com.optiplant.inventario.sale.application.port.out.SaleRepositoryPort;
import co.com.optiplant.inventario.sale.domain.model.Sale;
import co.com.optiplant.inventario.sale.domain.model.SaleDetail;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class SalePersistenceAdapter implements SaleRepositoryPort {

    private final JpaSaleRepository jpaSaleRepository;

    public SalePersistenceAdapter(JpaSaleRepository jpaSaleRepository) {
        this.jpaSaleRepository = jpaSaleRepository;
    }

    @Override
    public Sale save(Sale sale) {
        SaleEntity entity = toEntity(sale);
        SaleEntity savedEntity = jpaSaleRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Sale> findById(Long id) {
        return jpaSaleRepository.findById(id).map(this::toDomain);
    }

    private SaleEntity toEntity(Sale domain) {
        SaleEntity entity = new SaleEntity();
        entity.setId(domain.getId());
        entity.setDate(domain.getDate());
        entity.setTotal(domain.getTotal());
        entity.setBranchId(domain.getBranchId());
        entity.setUserId(domain.getUserId());

        if (domain.getDetails() != null) {
            for (SaleDetail detail : domain.getDetails()) {
                SaleDetailEntity detailEntity = new SaleDetailEntity();
                detailEntity.setId(detail.getId());
                detailEntity.setProductId(detail.getProductId());
                detailEntity.setQuantity(detail.getQuantity());
                detailEntity.setUnitPriceApplied(detail.getUnitPriceApplied());
                
                entity.addDetail(detailEntity);
            }
        }
        return entity;
    }

    private Sale toDomain(SaleEntity entity) {
        return new Sale(
                entity.getId(),
                entity.getDate(),
                entity.getTotal(),
                entity.getBranchId(),
                entity.getUserId(),
                entity.getDetails().stream().map(d -> new SaleDetail(
                        d.getId(),
                        d.getProductId(),
                        d.getQuantity(),
                        d.getUnitPriceApplied()
                )).collect(Collectors.toList())
        );
    }
}
