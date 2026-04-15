package co.com.optiplant.inventario.auth.infrastructure.adapter.out.persistence;

import co.com.optiplant.inventario.auth.application.port.out.UserRepositoryPort;
import co.com.optiplant.inventario.auth.domain.model.User;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adaptador de salida que implementa {@link UserRepositoryPort} con Spring Data JPA.
 */
@Component
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final JpaUserRepository jpaRepository;

    public UserPersistenceAdapter(JpaUserRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(UserEntity::toDomain);
    }
}
