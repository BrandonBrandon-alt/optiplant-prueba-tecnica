package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.InsufficientStockException;
import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.BranchEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.InventoryMovementEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.LocalInventoryEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.UserEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.BranchRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.InventoryMovementRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.LocalInventoryRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.ProductRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InventoryUseCase {

    private final LocalInventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final StockAlertUseCase stockAlertUseCase;

    public InventoryUseCase(LocalInventoryRepository inventoryRepository,
                            InventoryMovementRepository movementRepository,
                            ProductRepository productRepository,
                            BranchRepository branchRepository,
                            UserRepository userRepository,
                            @Lazy StockAlertUseCase stockAlertUseCase) {
        this.inventoryRepository = inventoryRepository;
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
        this.branchRepository = branchRepository;
        this.userRepository = userRepository;
        this.stockAlertUseCase = stockAlertUseCase;
    }

    @Transactional(readOnly = true)
    public List<LocalInventoryEntity> getInventoryByBranch(Long branchId) {
        return inventoryRepository.findBySucursalId(branchId);
    }

    @Transactional
    public void registerMovement(InventoryMovementRequest request) {
        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "ID", request.getProductId()));

        BranchEntity branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getBranchId()));

        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "ID", request.getUserId()));

        LocalInventoryEntity localInventory = inventoryRepository
                .findBySucursalIdAndProductoId(branch.getId(), product.getId())
                .orElseGet(() -> LocalInventoryEntity.builder()
                        .sucursal(branch)
                        .producto(product)
                        .cantidadActual(BigDecimal.ZERO)
                        .stockMinimo(BigDecimal.TEN) // Valor por defecto
                        .build());

        // Validar stock si es un retiro
        if ("RETIRO".equalsIgnoreCase(request.getType())) {
            if (localInventory.getCantidadActual().compareTo(request.getQuantity()) < 0) {
                throw new InsufficientStockException("El stock actual (" + localInventory.getCantidadActual() + 
                                                     ") es menor a la cantidad solicitada para retiro (" + request.getQuantity() + ")");
            }
            localInventory.setCantidadActual(localInventory.getCantidadActual().subtract(request.getQuantity()));
        } else if ("INGRESO".equalsIgnoreCase(request.getType())) {
            localInventory.setCantidadActual(localInventory.getCantidadActual().add(request.getQuantity()));
        } else {
            throw new IllegalArgumentException("Tipo de movimiento no soportado: " + request.getType());
        }

        // Guardar el nuevo saldo
        inventoryRepository.save(localInventory);

        // Guardar el registro de auditoría (Kardex)
        InventoryMovementEntity movement = InventoryMovementEntity.builder()
                .tipo(request.getType().toUpperCase())
                .motivo(request.getReason().toUpperCase())
                .cantidad(request.getQuantity())
                .producto(product)
                .sucursal(branch)
                .usuario(user)
                .referenciaId(request.getReferenceId())
                .tipoReferencia(request.getReferenceType())
                .build();

        movementRepository.save(movement);

        // Evaluar si el stock cayó por debajo del umbral mínimo y generar alerta si es necesario
        stockAlertUseCase.evaluateAndCreate(localInventory);
    }
}
