package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.UserUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UserRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserUseCase userUseCase;

    public UserController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    /** GET /api/users — Lista todos los usuarios (sin exponer contraseñas) */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userUseCase.getAllUsers());
    }

    /** GET /api/users/{id} — Detalle de un usuario por ID */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userUseCase.getUserById(id));
    }

    /** POST /api/users — Registrar nuevo usuario (hashea la contraseña automáticamente) */
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
        UserResponse created = userUseCase.createUser(request);
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(created);
    }

    /** PUT /api/users/{id} — Actualizar usuario (contraseña opcional) */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userUseCase.updateUser(id, request));
    }

    /** DELETE /api/users/{id} — Eliminar usuario */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userUseCase.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
