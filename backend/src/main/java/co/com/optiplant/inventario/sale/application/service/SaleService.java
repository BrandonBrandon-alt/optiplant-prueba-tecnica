package co.com.optiplant.inventario.sale.application.service;

import co.com.optiplant.inventario.catalog.application.port.in.ProductUseCase;
import co.com.optiplant.inventario.catalog.domain.model.Product;
import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.domain.model.MovementReason;
import co.com.optiplant.inventario.sale.application.port.in.CreateSaleCommand;
import co.com.optiplant.inventario.sale.application.port.in.CreateSaleUseCase;
import co.com.optiplant.inventario.sale.application.port.out.SaleRepositoryPort;
import co.com.optiplant.inventario.sale.domain.model.Sale;
import co.com.optiplant.inventario.sale.domain.model.SaleDetail;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleService implements CreateSaleUseCase {

    private final SaleRepositoryPort saleRepositoryPort;
    private final ProductUseCase productUseCase;
    private final InventoryUseCase inventoryUseCase;

    public SaleService(SaleRepositoryPort saleRepositoryPort, ProductUseCase productUseCase, InventoryUseCase inventoryUseCase) {
        this.saleRepositoryPort = saleRepositoryPort;
        this.productUseCase = productUseCase;
        this.inventoryUseCase = inventoryUseCase;
    }

    @Override
    @Transactional
    public Sale execute(CreateSaleCommand command) {
        // 1. Map to details and gather required valid states
        List<SaleDetail> details = command.items().stream()
                .map(item -> {
                    // This throws exception if product doesn't exist
                    Product product = productUseCase.getProductById(item.productId());
                    
                    return SaleDetail.create(
                            item.productId(),
                            item.quantity(),
                            product.getSalePrice()
                    );
                }).toList();

        // 2. Create the aggregate (will self-calculate the total and validate emptiness)
        Sale sale = Sale.create(
                command.branchId(),
                command.userId(),
                details
        );

        // 3. Persist the sale records (Headers + details)
        Sale savedSale = saleRepositoryPort.save(sale);

        // 4. Register native atomic operations over the inventory module (Cross-Module Orchestration)
        // Since we are under @Transactional, if one deduction fails due to lack of stock,
        // everything including the sale save will rollback automatically.
        for (SaleDetail detail : details) {
            inventoryUseCase.withdrawStock(
                    command.branchId(), 
                    detail.getProductId(), 
                    BigDecimal.valueOf(detail.getQuantity()), 
                    MovementReason.VENTA, 
                    command.userId(),
                    savedSale.getId(),
                    "VENTA"
            );
        }

        return savedSale;
    }
}
