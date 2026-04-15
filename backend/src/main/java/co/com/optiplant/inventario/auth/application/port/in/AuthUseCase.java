package co.com.optiplant.inventario.auth.application.port.in;

/**
 * Puerto de entrada para los casos de uso de autenticación.
 * El único caso de uso es el login: validar credenciales y retornar un JWT.
 */
public interface AuthUseCase {

    /**
     * Autentica a un usuario y retorna un token JWT firmado.
     *
     * @param email    correo electrónico registrado
     * @param password contraseña en texto plano (se compara con BCrypt)
     * @return token JWT válido para incluir en el header {@code Authorization: Bearer <token>}
     * @throws co.com.optiplant.inventario.auth.domain.exception.InvalidCredentialsException
     *         si el email no existe o la contraseña no coincide
     */
    String login(String email, String password);
}
