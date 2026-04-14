package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.enums.PurchaseOrderState;
import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.PurchaseRequest;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.*;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PurchaseUseCase — Tests Unitarios")
class PurchaseUseCaseTest {

    @Mock PurchaseOrderRepository purchaseOrderRepository;
    @Mock SupplierRepository      supplierRepository;
    @Mock UserRepository          userRepository;
    @Mock ProductRepository       productRepository;
    @Mock InventoryUseCase        inventoryUseCase;

    @InjectMocks PurchaseUseCase purchaseUseCase;

    private SupplierEntity supplier;
    private UserEntity     user;
    private ProductEntity  product;
    private BranchEntity   branch;

    @BeforeEach
    void setUp() {
        branch   = BranchEntity.builder().id(1L).nombre("Central").build();
        supplier = SupplierEntity.builder().id(1L).nombre("Argos").build();
        user     = UserEntity.builder().id(1L).nombre("Admin").sucursal(branch).build();
        product  = ProductEntity.builder().id(1L).nombre("Cemento").build();
    }

    private PurchaseRequest buildRequest() {
        PurchaseRequest.PurchaseItem item = new PurchaseRequest.PurchaseItem();
        item.setProductId(1L);
        item.setQuantity(BigDecimal.TEN);
        item.setUnitPrice(BigDecimal.valueOf(28500));

        PurchaseRequest req = new PurchaseRequest();
        req.setSupplierId(1L);
        req.setUserId(1L);
        req.setItems(List.of(item));
        return req;
    }

    private PurchaseOrderEntity buildPendingOrder() {
        PurchaseOrderEntity order = PurchaseOrderEntity.builder()
                .id(1L)
                .proveedor(supplier)
                .usuario(user)
                .estado(PurchaseOrderState.PENDIENTE)
                .detalles(new ArrayList<>())
                .build();

        PurchaseDetailEntity detail = PurchaseDetailEntity.builder()
                .id(1L)
                .producto(product)
                .cantidad(BigDecimal.TEN)
                .precioUnitario(BigDecimal.valueOf(28500))
                .build();
        order.addDetalle(detail);
        return order;
    }

    @Nested
    @DisplayName("createPurchaseOrder")
    class CreateTests {

        @Test
        @DisplayName("Debe crear la orden en estado PENDIENTE")
        void debeCrearEnEstadoPendiente() {
            when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(purchaseOrderRepository.save(any())).thenAnswer(inv -> {
                PurchaseOrderEntity o = inv.getArgument(0);
                return PurchaseOrderEntity.builder()
                        .id(1L).proveedor(o.getProveedor()).usuario(o.getUsuario())
                        .estado(o.getEstado()).detalles(o.getDetalles()).build();
            });

            Long id = purchaseUseCase.createPurchaseOrder(buildRequest());

            assertThat(id).isEqualTo(1L);
            verify(purchaseOrderRepository).save(argThat(o ->
                    o.getEstado() == PurchaseOrderState.PENDIENTE
            ));
        }

        @Test
        @DisplayName("Proveedor inexistente debe lanzar ResourceNotFoundException")
        void proveedorInexistente_debeLanzarNotFound() {
            when(supplierRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> purchaseUseCase.createPurchaseOrder(buildRequest()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("receivePurchaseOrder")
    class ReceiveTests {

        @Test
        @DisplayName("Debe cambiar estado a RECIBIDA y llamar a InventoryUseCase por cada ítem")
        void debeIngresarInventarioYCambiarEstado() {
            PurchaseOrderEntity order = buildPendingOrder();
            when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(purchaseOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            purchaseUseCase.receivePurchaseOrder(1L);

            assertThat(order.getEstado()).isEqualTo(PurchaseOrderState.RECIBIDA);
            verify(inventoryUseCase, times(order.getDetalles().size()))
                    .registerMovement(any());
        }

        @Test
        @DisplayName("Orden ya RECIBIDA debe lanzar IllegalStateException")
        void ordenYaRecibida_debeLanzarExcepcion() {
            PurchaseOrderEntity order = buildPendingOrder();
            order.setEstado(PurchaseOrderState.RECIBIDA);
            when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> purchaseUseCase.receivePurchaseOrder(1L))
                    .isInstanceOf(IllegalStateException.class);

            verify(inventoryUseCase, never()).registerMovement(any());
        }
    }

    @Nested
    @DisplayName("cancelPurchaseOrder")
    class CancelTests {

        @Test
        @DisplayName("Debe cambiar estado a CANCELADA")
        void debeCancelarOrdenPendiente() {
            PurchaseOrderEntity order = buildPendingOrder();
            when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(purchaseOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            purchaseUseCase.cancelPurchaseOrder(1L);

            assertThat(order.getEstado()).isEqualTo(PurchaseOrderState.CANCELADA);
        }

        @Test
        @DisplayName("Orden no PENDIENTE no puede cancelarse")
        void ordenCancelada_noPuedeCancelarse() {
            PurchaseOrderEntity order = buildPendingOrder();
            order.setEstado(PurchaseOrderState.CANCELADA);
            when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> purchaseUseCase.cancelPurchaseOrder(1L))
                    .isInstanceOf(IllegalStateException.class);
        }
    }
}
