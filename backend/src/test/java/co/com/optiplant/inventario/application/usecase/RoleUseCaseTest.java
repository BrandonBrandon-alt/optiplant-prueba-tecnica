package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.RoleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.RoleEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.RoleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleUseCase — Tests Unitarios")
class RoleUseCaseTest {

    @Mock RoleRepository roleRepository;
    @InjectMocks RoleUseCase roleUseCase;

    @Test
    @DisplayName("createRole: nombre debe guardarse en MAYÚSCULAS")
    void createRole_debeGuardarNombreEnMayusculas() {
        when(roleRepository.findByNombre("VENDEDOR")).thenReturn(Optional.empty());
        when(roleRepository.save(any())).thenAnswer(inv -> {
            RoleEntity r = inv.getArgument(0);
            r = RoleEntity.builder().id(10L).nombre(r.getNombre()).build();
            return r;
        });

        var response = roleUseCase.createRole(new RoleRequest("vendedor"));

        assertThat(response.getNombre()).isEqualTo("VENDEDOR");
    }

    @Test
    @DisplayName("createRole: nombre duplicado debe lanzar IllegalArgumentException")
    void createRole_conNombreDuplicado_debeLanzarExcepcion() {
        when(roleRepository.findByNombre("ADMIN"))
                .thenReturn(Optional.of(RoleEntity.builder().id(1L).nombre("ADMIN").build()));

        assertThatThrownBy(() -> roleUseCase.createRole(new RoleRequest("admin")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ADMIN");

        verify(roleRepository, never()).save(any());
    }

    @Test
    @DisplayName("getRoleById: ID inexistente debe lanzar ResourceNotFoundException")
    void getRoleById_conIdInexistente_debeLanzarNotFound() {
        when(roleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roleUseCase.getRoleById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("deleteRole: ID inexistente debe lanzar ResourceNotFoundException")
    void deleteRole_conIdInexistente_debeLanzarNotFound() {
        when(roleRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> roleUseCase.deleteRole(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("updateRole: nuevo nombre no puede pertenecer a otro rol")
    void updateRole_conNombreDeOtroRol_debeLanzarExcepcion() {
        RoleEntity existing = RoleEntity.builder().id(1L).nombre("ADMIN").build();
        RoleEntity target   = RoleEntity.builder().id(2L).nombre("VENDEDOR").build();

        when(roleRepository.findById(2L)).thenReturn(Optional.of(target));
        when(roleRepository.findByNombre("ADMIN")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> roleUseCase.updateRole(2L, new RoleRequest("admin")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
