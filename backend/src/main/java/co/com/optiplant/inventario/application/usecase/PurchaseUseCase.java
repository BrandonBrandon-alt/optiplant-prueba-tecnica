package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.enums.PurchaseOrderState;
import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.PurchaseRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.PurchaseResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.ProductEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.PurchaseDetailEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.PurchaseOrderEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.SupplierEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.UserEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.ProductRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.PurchaseOrderRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.SupplierRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseUseCase {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryUseCase inventoryUseCase;

    public PurchaseUseCase(PurchaseOrderRepository purchaseOrderRepository,
                           SupplierRepository supplierRepository,
                           UserRepository userRepository,
                           ProductRepository productRepository,
                           InventoryUseCase inventoryUseCase) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.inventoryUseCase = inventoryUseCase;
    }

    /**
     * Crea una nueva orden de compra en estado PENDIENTE.
     * No afecta el inventario hasta que sea RECIBIDA.
     */
    @Transactional
    public Long createPurchaseOrder(PurchaseRequest request) {
        SupplierEntity supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", "ID", request.getSupplierId()));

        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "ID", request.getUserId()));

        PurchaseOrderEntity order = PurchaseOrderEntity.builder()
                .proveedor(supplier)
                .usuario(user)
                .estado(PurchaseOrderState.PENDIENTE)
                .fechaEstimadaLlegada(
                        request.getEstimatedArrival() != null
                                ? LocalDateTime.parse(request.getEstimatedArrival())
                                : null)
                .build();

        for (PurchaseRequest.PurchaseItem item : request.getItems()) {
            ProductEntity product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", "ID", item.getProductId()));

            PurchaseDetailEntity detail = PurchaseDetailEntity.builder()
                    .producto(product)
                    .cantidad(item.getQuantity())
                    .precioUnitario(item.getUnitPrice())
                    .build();

            order.addDetalle(detail);
        }

        return purchaseOrderRepository.save(order).getId();
    }

    /**
     * Marca la orden como RECIBIDA e ingresa la mercancía al inventario de la sucursal del usuario responsable.
     */
    @Transactional
    public void receivePurchaseOrder(Long orderId) {
        PurchaseOrderEntity order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de Compra", "ID", orderId));

        if (order.getEstado() != PurchaseOrderState.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden recibir órdenes en estado PENDIENTE. Estado actual: " + order.getEstado());
        }

        // Ingresar cada ítem al inventario de la sucursal del usuario que recibe
        Long branchId = order.getUsuario().getSucursal().getId();
        Long userId = order.getUsuario().getId();

        for (PurchaseDetailEntity detail : order.getDetalles()) {
            InventoryMovementRequest movement = InventoryMovementRequest.builder()
                    .branchId(branchId)
                    .productId(detail.getProducto().getId())
                    .userId(userId)
                    .type("INGRESO")
                    .reason("COMPRA")
                    .quantity(detail.getCantidad())
                    .referenceId(order.getId())
                    .referenceType("ORDEN_COMPRA")
                    .build();

            inventoryUseCase.registerMovement(movement);
        }

        order.setEstado(PurchaseOrderState.RECIBIDA);
        purchaseOrderRepository.save(order);
    }

    /**
     * Cancela una orden en estado PENDIENTE.
     */
    @Transactional
    public void cancelPurchaseOrder(Long orderId) {
        PurchaseOrderEntity order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de Compra", "ID", orderId));

        if (order.getEstado() != PurchaseOrderState.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden cancelar órdenes en estado PENDIENTE.");
        }

        order.setEstado(PurchaseOrderState.CANCELADA);
        purchaseOrderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getAllOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getOrderById(Long id) {
        PurchaseOrderEntity order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de Compra", "ID", id));
        return mapToResponse(order);
    }

    private PurchaseResponse mapToResponse(PurchaseOrderEntity order) {
        List<PurchaseResponse.PurchaseDetailResponse> detalles = order.getDetalles().stream()
                .map(d -> PurchaseResponse.PurchaseDetailResponse.builder()
                        .id(d.getId())
                        .productoId(d.getProducto().getId())
                        .productoNombre(d.getProducto().getNombre())
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .build())
                .collect(Collectors.toList());

        return PurchaseResponse.builder()
                .id(order.getId())
                .estado(order.getEstado().name())
                .fechaSolicitud(order.getFechaSolicitud())
                .fechaEstimadaLlegada(order.getFechaEstimadaLlegada())
                .proveedorId(order.getProveedor().getId())
                .proveedorNombre(order.getProveedor().getNombre())
                .usuarioId(order.getUsuario().getId())
                .detalles(detalles)
                .build();
    }
}
