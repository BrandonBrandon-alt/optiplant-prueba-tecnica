package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.*;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.StockAlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("StockAlertUseCase — Tests Unitarios")
class StockAlertUseCaseTest {

    @Mock StockAlertRepository stockAlertRepository;
    @InjectMocks StockAlertUseCase stockAlertUseCase;

    private BranchEntity  branch;
    private ProductEntity product;

    @BeforeEach
    void setUp() {
        branch  = BranchEntity.builder().id(1L).nombre("Central").build();
        product = ProductEntity.builder().id(1L).nombre("Cemento").build();
    }

    private LocalInventoryEntity buildInventory(double current, double min) {
        return LocalInventoryEntity.builder()
                .sucursal(branch)
                .producto(product)
                .cantidadActual(BigDecimal.valueOf(current))
                .stockMinimo(BigDecimal.valueOf(min))
                .build();
    }

    @Test
    @DisplayName("Debe crear alerta cuando el stock cae por debajo del mínimo")
    void evaluateAndCreate_siStockBajoMinimo_debeCrearAlerta() {
        LocalInventoryEntity inv = buildInventory(5.0, 10.0); // 5 < 10 → alerta

        stockAlertUseCase.evaluateAndCreate(inv);

        verify(stockAlertRepository).save(argThat(alert ->
                !alert.getResuelta() &&
                alert.getProducto().getId().equals(1L) &&
                alert.getSucursal().getId().equals(1L)
        ));
    }

    @Test
    @DisplayName("NO debe crear alerta cuando el stock es igual o mayor al mínimo")
    void evaluateAndCreate_siStockSobreMinimo_noDebeCrearAlerta() {
        LocalInventoryEntity inv = buildInventory(15.0, 10.0); // 15 ≥ 10 → sin alerta

        stockAlertUseCase.evaluateAndCreate(inv);

        verify(stockAlertRepository, never()).save(any());
    }

    @Test
    @DisplayName("NO debe crear alerta con stock exactamente igual al mínimo")
    void evaluateAndCreate_conStockExactoAlMinimo_noDebeCrearAlerta() {
        LocalInventoryEntity inv = buildInventory(10.0, 10.0); // 10 == 10 → sin alerta

        stockAlertUseCase.evaluateAndCreate(inv);

        verify(stockAlertRepository, never()).save(any());
    }

    @Test
    @DisplayName("resolveAlert: debe marcar la alerta como resuelta")
    void resolveAlert_debeMarcarComoResuelta() {
        StockAlertEntity alert = StockAlertEntity.builder()
                .id(1L).sucursal(branch).producto(product)
                .mensaje("alerta").resuelta(false).build();

        when(stockAlertRepository.findById(1L)).thenReturn(Optional.of(alert));
        when(stockAlertRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        stockAlertUseCase.resolveAlert(1L);

        assertThat(alert.getResuelta()).isTrue();
        verify(stockAlertRepository).save(alert);
    }

    @Test
    @DisplayName("resolveAlert: ID inexistente debe lanzar ResourceNotFoundException")
    void resolveAlert_conIdInexistente_debeLanzarNotFound() {
        when(stockAlertRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockAlertUseCase.resolveAlert(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
