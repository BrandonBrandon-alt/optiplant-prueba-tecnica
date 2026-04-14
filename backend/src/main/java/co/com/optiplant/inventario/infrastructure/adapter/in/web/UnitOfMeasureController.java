package co.com.optiplant.inventario.infrastructure.adapter.in.web;

import co.com.optiplant.inventario.application.usecase.UnitOfMeasureUseCase;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UnitOfMeasureRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UnitOfMeasureResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/units")
public class UnitOfMeasureController {

    private final UnitOfMeasureUseCase unitUseCase;

    public UnitOfMeasureController(UnitOfMeasureUseCase unitUseCase) {
        this.unitUseCase = unitUseCase;
    }

    /** GET /api/units — Lista todas las unidades de medida */
    @GetMapping
    public ResponseEntity<List<UnitOfMeasureResponse>> getAll() {
        return ResponseEntity.ok(unitUseCase.getAll());
    }

    /** GET /api/units/{id} — Obtiene una unidad por ID */
    @GetMapping("/{id}")
    public ResponseEntity<UnitOfMeasureResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(unitUseCase.getById(id));
    }

    /** POST /api/units — Crea una nueva unidad de medida */
    @PostMapping
    public ResponseEntity<UnitOfMeasureResponse> create(@Valid @RequestBody UnitOfMeasureRequest request) {
        UnitOfMeasureResponse created = unitUseCase.create(request);
        return ResponseEntity.created(URI.create("/api/units/" + created.getId())).body(created);
    }

    /** PUT /api/units/{id} — Actualiza una unidad de medida */
    @PutMapping("/{id}")
    public ResponseEntity<UnitOfMeasureResponse> update(@PathVariable Long id,
                                                        @Valid @RequestBody UnitOfMeasureRequest request) {
        return ResponseEntity.ok(unitUseCase.update(id, request));
    }

    /** DELETE /api/units/{id} — Elimina una unidad de medida */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        unitUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
