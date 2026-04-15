package co.com.optiplant.inventario.auth.infrastructure.adapter.in.web.dto;

/**
 * DTO de salida con el token JWT generado tras un login exitoso.
 *
 * <p>El cliente debe incluir este token en cada petición posterior:
 * {@code Authorization: Bearer <token>}</p>
 */
public record LoginResponse(
        String token,
        String tipo,
        String email
) {
    /** Constructor de conveniencia: tipo siempre es "Bearer". */
    public LoginResponse(String token, String email) {
        this(token, "Bearer", email);
    }
}
