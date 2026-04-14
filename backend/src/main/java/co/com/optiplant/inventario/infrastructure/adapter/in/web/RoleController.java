package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.RoleUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.RoleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.RoleResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleUseCase roleUseCase;

    public RoleController(RoleUseCase roleUseCase) {
        this.roleUseCase = roleUseCase;
    }

    /** GET /api/roles — Lista todos los roles */
    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAll() {
        return ResponseEntity.ok(roleUseCase.getAllRoles());
    }

    /** GET /api/roles/{id} — Obtiene un rol por ID */
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roleUseCase.getRoleById(id));
    }

    /** POST /api/roles — Crea un nuevo rol */
    @PostMapping
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody RoleRequest request) {
        RoleResponse created = roleUseCase.createRole(request);
        return ResponseEntity.created(URI.create("/api/roles/" + created.getId())).body(created);
    }

    /** PUT /api/roles/{id} — Actualiza el nombre de un rol */
    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(roleUseCase.updateRole(id, request));
    }

    /** DELETE /api/roles/{id} — Elimina un rol */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleUseCase.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
