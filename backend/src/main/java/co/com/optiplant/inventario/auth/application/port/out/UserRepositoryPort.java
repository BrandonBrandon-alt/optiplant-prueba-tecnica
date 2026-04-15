package co.com.optiplant.inventario.auth.application.port.out;

import co.com.optiplant.inventario.auth.domain.model.User;
import java.util.Optional;

/**
 * Puerto de salida para la persistencia de Usuarios.
 * El dominio depende de esta interfaz; la implementación concreta
 * con JPA es {@code UserPersistenceAdapter}.
 */
public interface UserRepositoryPort {

    /**
     * Busca un usuario por su email (login).
     * @return Optional vacío si el email no está registrado.
     */
    Optional<User> findByEmail(String email);
}
