package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleResponse;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        this.inventoryUseCase = inventoryUseCase;
    }

    /** Registra una nueva venta, valida y descuenta el stock por cada ítem. */
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

            // Lanzará InsufficientStockException si no hay stock suficiente
            InventoryMovementRequest movement = InventoryMovementRequest.builder()
                    .branchId(branch.getId())
                    .productId(product.getId())
                    .userId(user.getId())
                    .type("RETIRO")
                    .reason("VENTA")
                    .quantity(new BigDecimal(item.getQuantity()))
                    .referenceType("VENTA")
                    .build();

            inventoryUseCase.registerMovement(movement);

            SaleDetailEntity detail = SaleDetailEntity.builder()
                    .producto(product)
                    .cantidad(item.getQuantity())
                    .precioUnitarioAplicado(item.getUnitPrice())
                    .build();

            sale.addDetalle(detail);

            BigDecimal subtotal = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
            runningTotal = runningTotal.add(subtotal);
        }

        sale.setTotal(runningTotal);
        return saleRepository.save(sale).getId();
    }

    /** Lista todas las ventas del sistema. */
    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Detalle completo de una venta por ID. */
    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        return mapToResponse(
                saleRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Venta", "ID", id))
        );
    }

    /** Ventas de una sucursal en un rango de fechas. */
    @Transactional(readOnly = true)
    public List<SaleResponse> getSalesByBranch(Long branchId, LocalDateTime from, LocalDateTime to) {
        LocalDateTime start = (from != null) ? from : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime end   = (to   != null) ? to   : LocalDateTime.now();
        return saleRepository.findBySucursalIdAndFechaBetween(branchId, start, end).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SaleResponse mapToResponse(SaleEntity entity) {
        List<SaleResponse.SaleDetailDto> detalles = entity.getDetalles().stream()
                .map(d -> SaleResponse.SaleDetailDto.builder()
                        .id(d.getId())
                        .productoId(d.getProducto().getId())
                        .productoNombre(d.getProducto().getNombre())
                        .cantidad(d.getCantidad())
                        .precioUnitarioAplicado(d.getPrecioUnitarioAplicado())
                        .subtotal(d.getPrecioUnitarioAplicado().multiply(new BigDecimal(d.getCantidad())))
                        .build())
                .collect(Collectors.toList());

        return SaleResponse.builder()
                .id(entity.getId())
                .fecha(entity.getFecha())
                .total(entity.getTotal())
                .sucursalId(entity.getSucursal().getId())
                .sucursalNombre(entity.getSucursal().getNombre())
                .usuarioId(entity.getUsuario().getId())
                .usuarioNombre(entity.getUsuario().getNombre())
                .detalles(detalles)
                .build();
    }
}
