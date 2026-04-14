package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.BranchEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.SaleDetailEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.SaleEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.UserEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.BranchRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.ProductRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.SaleRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class SaleUseCase {

    private final SaleRepository saleRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryUseCase inventoryUseCase;

    public SaleUseCase(SaleRepository saleRepository,
                       BranchRepository branchRepository,
                       UserRepository userRepository,
                       ProductRepository productRepository,
                       InventoryUseCase inventoryUseCase) {
        this.saleRepository = saleRepository;
        this.branchRepository = branchRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.inventoryUseCase = inventoryUseCase; // Inyección crucial para interactuar con inventario
    }

    @Transactional
    public Long registerSale(SaleRequest request) {
        BranchEntity branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getBranchId()));

        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "ID", request.getUserId()));

        SaleEntity sale = SaleEntity.builder()
                .sucursal(branch)
                .usuario(user)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        for (SaleRequest.SaleItem item : request.getItems()) {
            ProductEntity product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", "ID", item.getProductId()));

            // 1. Validar e insertar retiro en inventario a través de InventoryUseCase
            // Esto lanzará InsufficientStockException si no hay stock
            InventoryMovementRequest movement = InventoryMovementRequest.builder()
                    .branchId(branch.getId())
                    .productId(product.getId())
                    .userId(user.getId())
                    .type("RETIRO")
                    .reason("VENTA")
                    .quantity(new BigDecimal(item.getQuantity()))
                    .referenceType("VENTA")
                    // referenceId se actualiza después de guardar la venta, o guardamos la venta primero
                    .build();

            inventoryUseCase.registerMovement(movement);

            // 2. Construir detalle de la venta
            SaleDetailEntity detail = SaleDetailEntity.builder()
                    .producto(product)
                    .cantidad(item.getQuantity())
                    .precioUnitarioAplicado(item.getUnitPrice())
                    .build();

            sale.addDetalle(detail);

            // 3. Calcular total
            BigDecimal subtotal = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
            runningTotal = runningTotal.add(subtotal);
        }

        sale.setTotal(runningTotal);
        
        // El CascadeType.ALL guardará los detalles automáticamente gracias a tu diseño Cabecera/Detalle
        SaleEntity savedSale = saleRepository.save(sale);
        return savedSale.getId();
    }
}
