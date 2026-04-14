package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.InsufficientStockException;
import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.InventoryMovementRequest;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryUseCase — Tests Unitarios")
class InventoryUseCaseTest {

    @Mock
    LocalInventoryRepository inventoryRepository;
    @Mock
    InventoryMovementRepository movementRepository;
    @Mock
    ProductRepository productRepository;
    @Mock
    BranchRepository branchRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    StockAlertUseCase stockAlertUseCase;

    @InjectMocks
    InventoryUseCase inventoryUseCase;

    // ── Fixtures ────────────────────────────────────────────────
    private ProductEntity product;
    private BranchEntity branch;
    private UserEntity user;

    @BeforeEach
    void setUpEntities() {
        product = ProductEntity.builder().id(1L).nombre("Cemento").build();
        branch = BranchEntity.builder().id(1L).nombre("Central").build();
        user = UserEntity.builder().id(1L).nombre("Admin").build();
    }

    private LocalInventoryEntity inventoryWithStock(double stock) {
        return LocalInventoryEntity.builder()
                .sucursal(branch)
                .producto(product)
                .cantidadActual(BigDecimal.valueOf(stock))
                .stockMinimo(BigDecimal.TEN)
                .build();
    }

    private InventoryMovementRequest buildRequest(String type, double qty) {
        return InventoryMovementRequest.builder()
                .branchId(1L).productId(1L).userId(1L)
                .type(type).reason("TEST")
                .quantity(BigDecimal.valueOf(qty))
                .build();
    }

    // ── INGRESO ─────────────────────────────────────────────────
    @Nested
    @DisplayName("Movimiento INGRESO")
    class IngresoTests {

        @Test
        @DisplayName("Debe aumentar el stock actual correctamente")
        void ingreso_debeAumentarStock() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            LocalInventoryEntity inv = inventoryWithStock(50.0);
            when(inventoryRepository.findBySucursalIdAndProductoId(1L, 1L)).thenReturn(Optional.of(inv));
            when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            inventoryUseCase.registerMovement(buildRequest("INGRESO", 30.0));

            assertThat(inv.getCantidadActual()).isEqualByComparingTo("80.0");
            verify(inventoryRepository).save(inv);
            verify(movementRepository).save(any(InventoryMovementEntity.class));
        }

        @Test
        @DisplayName("Sin inventario previo debe crear el registro desde cero")
        void ingreso_sinInventarioPrevio_debeCriarRegistro() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(inventoryRepository.findBySucursalIdAndProductoId(1L, 1L)).thenReturn(Optional.empty());
            when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            inventoryUseCase.registerMovement(buildRequest("INGRESO", 20.0));

            verify(inventoryRepository)
                    .save(argThat(inv -> inv.getCantidadActual().compareTo(BigDecimal.valueOf(20.0)) == 0));
        }
    }

    // ── RETIRO ──────────────────────────────────────────────────
    @Nested
    @DisplayName("Movimiento RETIRO")
    class RetiroTests {

        @Test
        @DisplayName("Debe disminuir el stock cuando hay suficiente")
        void retiro_conStockSuficiente_debeDisminiurStock() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            LocalInventoryEntity inv = inventoryWithStock(100.0);
            when(inventoryRepository.findBySucursalIdAndProductoId(1L, 1L)).thenReturn(Optional.of(inv));
            when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            inventoryUseCase.registerMovement(buildRequest("RETIRO", 40.0));

            assertThat(inv.getCantidadActual()).isEqualByComparingTo("60.0");
        }

        @Test
        @DisplayName("Debe lanzar InsufficientStockException si el stock es insuficiente")
        void retiro_conStockInsuficiente_debeLanzarExcepcion() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(inventoryRepository.findBySucursalIdAndProductoId(1L, 1L))
                    .thenReturn(Optional.of(inventoryWithStock(5.0)));

            assertThatThrownBy(() -> inventoryUseCase.registerMovement(buildRequest("RETIRO", 10.0)))
                    .isInstanceOf(InsufficientStockException.class);

            verify(inventoryRepository, never()).save(any());
            verify(movementRepository, never()).save(any());
        }

        @Test
        @DisplayName("Debe invocar a StockAlertUseCase.evaluateAndCreate tras el movimiento")
        void retiro_debeLlamarEvaluacionDeAlertas() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            LocalInventoryEntity inv = inventoryWithStock(20.0);
            when(inventoryRepository.findBySucursalIdAndProductoId(1L, 1L)).thenReturn(Optional.of(inv));
            when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            inventoryUseCase.registerMovement(buildRequest("RETIRO", 5.0));

            verify(stockAlertUseCase).evaluateAndCreate(any(LocalInventoryEntity.class));
        }
    }

    // ── ERRORES COMUNES ─────────────────────────────────────────
    @Nested
    @DisplayName("Validaciones de entidades")
    class EntityValidationTests {

        @Test
        @DisplayName("Producto inexistente debe lanzar ResourceNotFoundException")
        void productoInexistente_debeLanzarNotFound() {
            when(productRepository.findById(99L)).thenReturn(Optional.empty());

            InventoryMovementRequest req = InventoryMovementRequest.builder()
                    .branchId(1L).productId(99L).userId(1L)
                    .type("INGRESO").reason("TEST")
                    .quantity(BigDecimal.TEN).build();

            assertThatThrownBy(() -> inventoryUseCase.registerMovement(req))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");
        }

        @Test
        @DisplayName("Tipo de movimiento desconocido debe lanzar IllegalArgumentException")
        void tipoDesconocido_debeLanzarIllegalArgument() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(inventoryRepository.findBySucursalIdAndProductoId(1L, 1L))
                    .thenReturn(Optional.of(inventoryWithStock(50.0)));

            assertThatThrownBy(() -> inventoryUseCase.registerMovement(buildRequest("DESCONOCIDO", 5.0)))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }
}
