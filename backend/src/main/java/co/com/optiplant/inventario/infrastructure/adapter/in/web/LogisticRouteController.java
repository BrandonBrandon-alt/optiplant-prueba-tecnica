package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.LogisticRouteUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.LogisticRouteRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.LogisticRouteResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class LogisticRouteController {

    private final LogisticRouteUseCase routeUseCase;

    public LogisticRouteController(LogisticRouteUseCase routeUseCase) {
        this.routeUseCase = routeUseCase;
    }

    /** GET /api/routes — Lista todas las rutas logísticas */
    @GetMapping
    public ResponseEntity<List<LogisticRouteResponse>> getAll() {
        return ResponseEntity.ok(routeUseCase.getAll());
    }

    /** GET /api/routes/{id} — Detalle de una ruta por ID */
    @GetMapping("/{id}")
    public ResponseEntity<LogisticRouteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(routeUseCase.getById(id));
    }

    /** GET /api/routes/from/{branchId} — Rutas disponibles desde una sucursal origen */
    @GetMapping("/from/{branchId}")
    public ResponseEntity<List<LogisticRouteResponse>> getByOrigin(@PathVariable Long branchId) {
        return ResponseEntity.ok(routeUseCase.getByOrigin(branchId));
    }

    /** POST /api/routes — Crear nueva ruta entre dos sucursales */
    @PostMapping
    public ResponseEntity<LogisticRouteResponse> create(@Valid @RequestBody LogisticRouteRequest request) {
        LogisticRouteResponse created = routeUseCase.create(request);
        return ResponseEntity.created(URI.create("/api/routes/" + created.getId())).body(created);
    }

    /** PUT /api/routes/{id} — Actualizar tiempo estimado y/o costo de flete */
    @PutMapping("/{id}")
    public ResponseEntity<LogisticRouteResponse> update(@PathVariable Long id,
                                                        @Valid @RequestBody LogisticRouteRequest request) {
        return ResponseEntity.ok(routeUseCase.update(id, request));
    }

    /** DELETE /api/routes/{id} — Eliminar una ruta logística */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        routeUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
