package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleRequest;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SaleUseCase — Tests Unitarios")
class SaleUseCaseTest {

    @Mock SaleRepository    saleRepository;
    @Mock BranchRepository  branchRepository;
    @Mock UserRepository    userRepository;
    @Mock ProductRepository productRepository;
    @Mock InventoryUseCase  inventoryUseCase;

    @InjectMocks SaleUseCase saleUseCase;

    private BranchEntity  branch;
    private UserEntity    user;
    private ProductEntity product;

    @BeforeEach
    void setUp() {
        branch  = BranchEntity.builder().id(1L).nombre("Central").build();
        user    = UserEntity.builder().id(1L).nombre("Admin").build();
        product = ProductEntity.builder().id(1L).nombre("Cemento")
                .precioVenta(BigDecimal.valueOf(34000)).build();
    }

    private SaleRequest buildRequest(int qty, BigDecimal unitPrice) {
        SaleRequest.SaleItem item = new SaleRequest.SaleItem();
        item.setProductId(1L);
        item.setQuantity(qty);
        item.setUnitPrice(unitPrice);

        SaleRequest req = new SaleRequest();
        req.setBranchId(1L);
        req.setUserId(1L);
        req.setItems(List.of(item));
        return req;
    }

    @Nested
    @DisplayName("registerSale")
    class RegisterTests {

        @Test
        @DisplayName("Debe retornar el ID de la venta creada")
        void conDatosValidos_debeRetornarId() {
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(saleRepository.save(any())).thenAnswer(inv -> {
                SaleEntity s = inv.getArgument(0);
                s = SaleEntity.builder().id(42L).sucursal(s.getSucursal())
                        .usuario(s.getUsuario()).total(s.getTotal())
                        .detalles(new ArrayList<>()).build();
                return s;
            });

            Long id = saleUseCase.registerSale(buildRequest(2, BigDecimal.valueOf(34000)));

            assertThat(id).isEqualTo(42L);
        }

        @Test
        @DisplayName("Debe calcular el total correctamente (qty * unitPrice)")
        void debeCalcularTotalCorrectamente() {
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(saleRepository.save(any())).thenAnswer(inv -> {
                SaleEntity s = inv.getArgument(0);
                return SaleEntity.builder().id(1L).sucursal(s.getSucursal())
                        .usuario(s.getUsuario()).total(s.getTotal())
                        .detalles(new ArrayList<>()).build();
            });

            // 3 unidades × $34000 = $102000
            saleUseCase.registerSale(buildRequest(3, BigDecimal.valueOf(34000)));

            verify(saleRepository).save(argThat(s ->
                    s.getTotal().compareTo(BigDecimal.valueOf(102000)) == 0
            ));
        }

        @Test
        @DisplayName("Debe llamar a registerMovement(RETIRO) una vez por producto")
        void debeLlamarAlInventarioUseCase() {
            when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(saleRepository.save(any())).thenAnswer(inv -> {
                SaleEntity s = inv.getArgument(0);
                return SaleEntity.builder().id(1L).sucursal(s.getSucursal())
                        .usuario(s.getUsuario()).total(s.getTotal())
                        .detalles(new ArrayList<>()).build();
            });

            saleUseCase.registerSale(buildRequest(1, BigDecimal.valueOf(34000)));

            verify(inventoryUseCase).registerMovement(
                    argThat(m -> "RETIRO".equals(m.getType()) && "VENTA".equals(m.getReason()))
            );
        }

        @Test
        @DisplayName("Sucursal inexistente debe lanzar ResourceNotFoundException")
        void sucursalInexistente_debeLanzarNotFound() {
            when(branchRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> saleUseCase.registerSale(buildRequest(1, BigDecimal.TEN)))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(saleRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Consultas históricas")
    class QueryTests {

        @Test
        @DisplayName("getAllSales: debe retornar lista con los elementos del repositorio")
        void getAllSales_debeRetornarLista() {
            SaleEntity sale = SaleEntity.builder()
                    .id(1L).sucursal(branch).usuario(user)
                    .total(BigDecimal.valueOf(34000))
                    .fecha(LocalDateTime.now())
                    .detalles(new ArrayList<>())
                    .build();

            when(saleRepository.findAll()).thenReturn(List.of(sale));

            var result = saleUseCase.getAllSales();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("getSaleById: ID inexistente debe lanzar ResourceNotFoundException")
        void getSaleById_idInexistente_debeLanzarNotFound() {
            when(saleRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> saleUseCase.getSaleById(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("getSalesByBranch: debe aplicar valores por defecto si from/to son null")
        void getSalesByBranch_sinFechas_debeUsarFechasPorDefecto() {
            when(saleRepository.findBySucursalIdAndFechaBetween(eq(1L), any(), any()))
                    .thenReturn(List.of());

            var result = saleUseCase.getSalesByBranch(1L, null, null);

            assertThat(result).isEmpty();
            verify(saleRepository).findBySucursalIdAndFechaBetween(eq(1L), any(), any());
        }
    }
}
