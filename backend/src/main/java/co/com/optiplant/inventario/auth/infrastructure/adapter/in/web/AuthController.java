package co.com.optiplant.inventario.auth.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.auth.application.port.in.AuthUseCase;
import co.com.optiplant.inventario.auth.infrastructure.adapter.in.web.dto.LoginRequest;
import co.com.optiplant.inventario.auth.infrastructure.adapter.in.web.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Adaptador de entrada REST para autenticación.
 *
 * <p>Expone un único endpoint público:
 * {@code POST /api/auth/login} → retorna un JWT.</p>
 *
 * <p>Este endpoint está permitido sin autenticación en {@code SecurityConfig}.</p>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthUseCase authUseCase;

    public AuthController(AuthUseCase authUseCase) {
        this.authUseCase = authUseCase;
    }

    /**
     * POST /api/auth/login
     *
     * <p>Cuerpo esperado:
     * <pre>{@code
     * {
     *   "email": "admin@optiplant.co",
     *   "password": "admin123"
     * }
     * }</pre>
     *
     * <p>Respuesta exitosa (200):
     * <pre>{@code
     * {
     *   "token": "eyJhbGciOiJIUzI1NiJ9...",
     *   "tipo": "Bearer",
     *   "email": "admin@optiplant.co"
     * }
     * }</pre>
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authUseCase.login(request.email(), request.password());
        return ResponseEntity.ok(new LoginResponse(token, request.email()));
    }
}
