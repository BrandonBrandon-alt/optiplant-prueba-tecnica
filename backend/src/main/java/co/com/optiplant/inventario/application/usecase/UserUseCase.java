package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UserRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UserResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.BranchEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.RoleEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.UserEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.BranchRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.RoleRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserUseCase {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    public UserUseCase(UserRepository userRepository,
                       RoleRepository roleRepository,
                       BranchRepository branchRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Lista todos los usuarios del sistema. */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Obtiene un usuario por ID. */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return mapToResponse(
                userRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario", "ID", id))
        );
    }

    /**
     * Registra un nuevo usuario.
     * La contraseña se hashea con BCrypt antes de persistir.
     * El email debe ser único en todo el sistema.
     */
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario con el email: " + request.getEmail());
        }

        RoleEntity role = roleRepository.findById(request.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol", "ID", request.getRolId()));

        BranchEntity branch = branchRepository.findById(request.getSucursalId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getSucursalId()));

        UserEntity user = UserEntity.builder()
                .nombre(request.getNombre())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(role)
                .sucursal(branch)
                .build();

        return mapToResponse(userRepository.save(user));
    }

    /**
     * Actualiza nombre, rol y sucursal de un usuario.
     * Si se envía una nueva contraseña (no blank), también se actualiza hasheada.
     */
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "ID", id));

        // Verificar que el nuevo email no lo use otro usuario diferente
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Ya existe un usuario con el email: " + request.getEmail());
            }
        });

        RoleEntity role = roleRepository.findById(request.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol", "ID", request.getRolId()));

        BranchEntity branch = branchRepository.findById(request.getSucursalId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getSucursalId()));

        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail().toLowerCase());
        user.setRol(role);
        user.setSucursal(branch);

        // Solo actualiza la contraseña si se envió una nueva
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return mapToResponse(userRepository.save(user));
    }

    /**
     * Elimina un usuario del sistema.
     * La BD rechazará si el usuario tiene registros asociados (ventas, movimientos, etc.)
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario", "ID", id);
        }
        userRepository.deleteById(id);
    }

    private UserResponse mapToResponse(UserEntity entity) {
        return UserResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .email(entity.getEmail())
                .rolId(entity.getRol().getId())
                .rolNombre(entity.getRol().getNombre())
                .sucursalId(entity.getSucursal() != null ? entity.getSucursal().getId() : null)
                .sucursalNombre(entity.getSucursal() != null ? entity.getSucursal().getNombre() : null)
                .build();
    }
}
