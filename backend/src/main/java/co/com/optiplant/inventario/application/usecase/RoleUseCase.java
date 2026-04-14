package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.RoleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.RoleResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.RoleEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleUseCase {

    private final RoleRepository roleRepository;

    public RoleUseCase(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /** Lista todos los roles registrados. */
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Obtiene un rol por ID. */
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", "ID", id));
        return mapToResponse(role);
    }

    /**
     * Crea un nuevo rol. Lanza excepción si el nombre ya existe
     * para respetar la restricción UNIQUE de la tabla.
     */
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        String nombreUpper = request.getNombre().toUpperCase();

        if (roleRepository.findByNombre(nombreUpper).isPresent()) {
            throw new IllegalArgumentException("Ya existe un rol con el nombre: " + nombreUpper);
        }

        RoleEntity role = RoleEntity.builder()
                .nombre(nombreUpper)
                .build();

        return mapToResponse(roleRepository.save(role));
    }

    /**
     * Actualiza el nombre de un rol existente.
     */
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", "ID", id));

        String nombreUpper = request.getNombre().toUpperCase();

        // Verificar que el nuevo nombre no lo use otro rol diferente
        roleRepository.findByNombre(nombreUpper).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Ya existe un rol con el nombre: " + nombreUpper);
            }
        });

        role.setNombre(nombreUpper);
        return mapToResponse(roleRepository.save(role));
    }

    /**
     * Elimina un rol.
     * NOTA: Si hay usuarios asignados a este rol, la BD lanzará
     * una violación de FK que será manejada por GlobalExceptionHandler.
     */
    @Transactional
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Rol", "ID", id);
        }
        roleRepository.deleteById(id);
    }

    private RoleResponse mapToResponse(RoleEntity entity) {
        return RoleResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .build();
    }
}
