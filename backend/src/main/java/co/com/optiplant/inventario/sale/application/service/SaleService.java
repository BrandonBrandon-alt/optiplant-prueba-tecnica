package co.com.optiplant.inventario.sale.application.service;

import co.com.optiplant.inventario.catalog.application.port.in.ProductUseCase;
import co.com.optiplant.inventario.catalog.domain.model.Product;
import co.com.optiplant.inventario.inventory.application.port.in.InventoryUseCase;
import co.com.optiplant.inventario.inventory.domain.model.MovementReason;
import co.com.optiplant.inventario.sale.application.port.in.CreateSaleCommand;
import co.com.optiplant.inventario.sale.application.port.in.CreateSaleUseCase;
import co.com.optiplant.inventario.sale.application.port.in.SaleManagementUseCase;
import co.com.optiplant.inventario.sale.application.port.out.SaleRepositoryPort;
import co.com.optiplant.inventario.sale.domain.model.Sale;
import co.com.optiplant.inventario.sale.domain.model.SaleDetail;
import co.com.optiplant.inventario.branch.application.port.in.BranchUseCase;
import co.com.optiplant.inventario.auth.application.port.in.UserUseCase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleService implements CreateSaleUseCase, SaleManagementUseCase {

    private final SaleRepositoryPort saleRepositoryPort;
    private final ProductUseCase productUseCase;
    private final InventoryUseCase inventoryUseCase;
    private final BranchUseCase branchUseCase;
    private final UserUseCase userUseCase;

    public SaleService(SaleRepositoryPort saleRepositoryPort, ProductUseCase productUseCase, InventoryUseCase inventoryUseCase,
                       BranchUseCase branchUseCase, UserUseCase userUseCase) {
        this.saleRepositoryPort = saleRepositoryPort;
        this.productUseCase = productUseCase;
        this.inventoryUseCase = inventoryUseCase;
        this.branchUseCase = branchUseCase;
        this.userUseCase = userUseCase;
    }

    @Override
    @Transactional
    public Sale execute(CreateSaleCommand command) {
        // 1. Mapear a detalles y validar precios pactados
        List<SaleDetail> details = command.items().stream()
                .map(item -> {
                    Product product = productUseCase.getProductById(item.productId());
                    
                    return SaleDetail.create(
                            item.productId(),
                            product.getName(),
                            item.quantity(),
                            product.getSalePrice(),
                            item.discountPercentage()
                    );
                }).toList();

        // 2. Obtener nombres de sucursal y vendedor para el snapshot
        String branchName = branchUseCase.getBranchById(command.branchId()).getName();
        String userName = userUseCase.getUserById(command.userId()).getNombre();

        // 3. Crear el agregado (con información de cliente)
        Sale sale = Sale.create(
                command.branchId(),
                branchName,
                command.userId(),
                userName,
                command.customerName(),
                command.customerDocument(),
                command.globalDiscountPercentage(),
                details
        );

        // 3. Persistir la venta
        Sale savedSale = saleRepositoryPort.save(sale);

        // 4. Descontar stock
        for (SaleDetail detail : details) {
            inventoryUseCase.withdrawStock(
                    command.branchId(), 
                    detail.getProductId(), 
                    detail.getProductName(),
                    BigDecimal.valueOf(detail.getQuantity()), 
                    MovementReason.VENTA, 
                    command.userId(),
                    savedSale.getId(),
                    "VENTA"
            );
        }

        return savedSale;
    }

    @Override
    public List<Sale> getAllSales() {
        return saleRepositoryPort.findAll();
    }

    @Override
    public List<Sale> getSalesByBranch(Long branchId) {
        return saleRepositoryPort.findByBranchId(branchId);
    }

    @Override
    public Sale getSaleById(Long id) {
        return saleRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));
    }

    @Override
    @Transactional
    public void cancelSale(Long id, String reason) {
        // 1. Obtener la venta
        Sale sale = getSaleById(id);

        // 2. Aplicar lógica de anulación en el dominio
        sale.cancel(reason);

        // 3. Persistir cambio de estado
        saleRepositoryPort.save(sale);

        // 4. Rollback de Stock: Devolver productos al inventario
        // Usamos MovementReason.ENTRADA o creamos uno nuevo si fuera necesario, 
        // pero usaremos una nota descriptiva.
        for (SaleDetail detail : sale.getDetails()) {
            inventoryUseCase.addStock(
                    sale.getBranchId(),
                    detail.getProductId(),
                    BigDecimal.valueOf(detail.getQuantity()),
                    MovementReason.DEVOLUCION,
                    sale.getUserId(), 
                    sale.getId(),
                    "ANULACIÓN DE VENTA #" + id + ": " + reason,
                    detail.getUnitPriceApplied()
            );
        }
    }
}
