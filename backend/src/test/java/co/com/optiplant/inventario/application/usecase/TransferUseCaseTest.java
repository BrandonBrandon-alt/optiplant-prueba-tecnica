package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.enums.TransferState;
import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.TransferRequest;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransferUseCase — Tests Unitarios")
class TransferUseCaseTest {

    @Mock TransferRepository  transferRepository;
    @Mock BranchRepository    branchRepository;
    @Mock ProductRepository   productRepository;
    @Mock InventoryUseCase    inventoryUseCase;

    @InjectMocks TransferUseCase transferUseCase;

    private BranchEntity  origin;
    private BranchEntity  dest;
    private ProductEntity product;

    @BeforeEach
    void setUp() {
        origin  = BranchEntity.builder().id(1L).nombre("Central").build();
        dest    = BranchEntity.builder().id(2L).nombre("Norte").build();
        product = ProductEntity.builder().id(1L).nombre("Cemento").build();
    }

    private TransferEntity buildTransfer(TransferState state) {
        TransferEntity t = TransferEntity.builder()
                .id(1L).sucursalOrigen(origin).sucursalDestino(dest)
                .estado(state).detalles(new ArrayList<>())
                .build();

        TransferDetailEntity detail = TransferDetailEntity.builder()
                .id(1L).producto(product)
                .cantidadSolicitada(20).cantidadEnviada(0).cantidadRecibida(0)
                .build();
        t.addDetalle(detail);
        return t;
    }

    private TransferRequest buildRequest() {
        TransferRequest.TransferItem item = new TransferRequest.TransferItem();
        item.setProductId(1L);
        item.setQuantity(20);

        TransferRequest req = new TransferRequest();
        req.setOriginBranchId(1L);
        req.setDestinationBranchId(2L);
        req.setItems(List.of(item));
        return req;
    }

    @Nested
    @DisplayName("requestTransfer")
    class RequestTests {

        @Test
        @DisplayName("Debe crear la transferencia en estado EN_PREPARACION")
        void debeCrearEnEstadoEnPreparacion() {
            when(branchRepository.findById(1L)).thenReturn(Optional.of(origin));
            when(branchRepository.findById(2L)).thenReturn(Optional.of(dest));
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(transferRepository.save(any())).thenAnswer(inv -> {
                TransferEntity t = inv.getArgument(0);
                return TransferEntity.builder()
                        .id(1L).sucursalOrigen(t.getSucursalOrigen())
                        .sucursalDestino(t.getSucursalDestino())
                        .estado(t.getEstado()).detalles(t.getDetalles()).build();
            });

            Long id = transferUseCase.requestTransfer(buildRequest());

            assertThat(id).isEqualTo(1L);
            verify(transferRepository).save(argThat(t ->
                    t.getEstado() == TransferState.EN_PREPARACION
            ));
        }

        @Test
        @DisplayName("Sucursal origen inexistente debe lanzar ResourceNotFoundException")
        void sucursalOrigenInexistente_debeLanzarNotFound() {
            when(branchRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> transferUseCase.requestTransfer(buildRequest()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("dispatchTransfer")
    class DispatchTests {

        @Test
        @DisplayName("Debe descontar inventario en origen y pasar a EN_TRANSITO")
        void debeDescontarInventarioOrigenYCambiarEstado() {
            TransferEntity transfer = buildTransfer(TransferState.EN_PREPARACION);
            when(transferRepository.findById(1L)).thenReturn(Optional.of(transfer));
            when(transferRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            transferUseCase.dispatchTransfer(1L, 1L);

            assertThat(transfer.getEstado()).isEqualTo(TransferState.EN_TRANSITO);
            verify(inventoryUseCase, atLeastOnce()).registerMovement(
                    argThat(m -> "RETIRO".equals(m.getType()))
            );
        }

        @Test
        @DisplayName("Transferencia no EN_PREPARACION no puede despacharse")
        void estadoIncorrecto_debeLanzarExcepcion() {
            TransferEntity transfer = buildTransfer(TransferState.EN_TRANSITO);
            when(transferRepository.findById(1L)).thenReturn(Optional.of(transfer));

            assertThatThrownBy(() -> transferUseCase.dispatchTransfer(1L, 1L))
                    .isInstanceOf(IllegalStateException.class);

            verify(inventoryUseCase, never()).registerMovement(any());
        }
    }

    @Nested
    @DisplayName("receiveTransfer")
    class ReceiveTests {

        @Test
        @DisplayName("Debe abonar inventario en destino, anotar faltantes y pasar a RECIBIDO")
        void debeAbonarInventarioDestinoYCambiarEstado() {
            TransferEntity transfer = buildTransfer(TransferState.EN_TRANSITO);
            transfer.getDetalles().get(0).setCantidadEnviada(20); // se envió todo
            when(transferRepository.findById(1L)).thenReturn(Optional.of(transfer));
            when(transferRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            transferUseCase.receiveTransfer(1L, 2L);

            assertThat(transfer.getEstado()).isEqualTo(TransferState.RECIBIDO);
            assertThat(transfer.getFechaRealLlegada()).isNotNull();
            verify(inventoryUseCase, atLeastOnce()).registerMovement(
                    argThat(m -> "INGRESO".equals(m.getType()))
            );
        }

        @Test
        @DisplayName("Transferencia no EN_TRANSITO no puede recibirse")
        void estadoIncorrecto_debeLanzarExcepcion() {
            TransferEntity transfer = buildTransfer(TransferState.EN_PREPARACION);
            when(transferRepository.findById(1L)).thenReturn(Optional.of(transfer));

            assertThatThrownBy(() -> transferUseCase.receiveTransfer(1L, 2L))
                    .isInstanceOf(IllegalStateException.class);
        }
    }
}
