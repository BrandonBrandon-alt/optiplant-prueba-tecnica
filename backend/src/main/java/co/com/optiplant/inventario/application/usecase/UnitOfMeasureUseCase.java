package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UnitOfMeasureRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UnitOfMeasureResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.UnitOfMeasureEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.UnitOfMeasureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnitOfMeasureUseCase {

    private final UnitOfMeasureRepository unitRepository;

    public UnitOfMeasureUseCase(UnitOfMeasureRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @Transactional(readOnly = true)
    public List<UnitOfMeasureResponse> getAll() {
        return unitRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UnitOfMeasureResponse getById(Long id) {
        return mapToResponse(
                unitRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Unidad de Medida", "ID", id))
        );
    }

    /**
     * Crea una nueva unidad de medida. Valida que la abreviatura sea única.
     */
    @Transactional
    public UnitOfMeasureResponse create(UnitOfMeasureRequest request) {
        String abrevUpper = request.getAbreviatura().toUpperCase();

        unitRepository.findByAbreviatura(abrevUpper).ifPresent(existing -> {
            throw new IllegalArgumentException("Ya existe una unidad con la abreviatura: " + abrevUpper);
        });

        UnitOfMeasureEntity entity = UnitOfMeasureEntity.builder()
                .nombre(request.getNombre())
                .abreviatura(abrevUpper)
                .build();

        return mapToResponse(unitRepository.save(entity));
    }

    /**
     * Actualiza nombre y abreviatura de una unidad existente.
     */
    @Transactional
    public UnitOfMeasureResponse update(Long id, UnitOfMeasureRequest request) {
        UnitOfMeasureEntity entity = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad de Medida", "ID", id));

        String abrevUpper = request.getAbreviatura().toUpperCase();

        // Verifica que la nueva abreviatura no pertenezca a otra unidad
        unitRepository.findByAbreviatura(abrevUpper).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Ya existe una unidad con la abreviatura: " + abrevUpper);
            }
        });

        entity.setNombre(request.getNombre());
        entity.setAbreviatura(abrevUpper);

        return mapToResponse(unitRepository.save(entity));
    }

    /**
     * Elimina una unidad de medida.
     * La BD rechazará si está siendo usada en producto_unidad.
     */
    @Transactional
    public void delete(Long id) {
        if (!unitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Unidad de Medida", "ID", id);
        }
        unitRepository.deleteById(id);
    }

    private UnitOfMeasureResponse mapToResponse(UnitOfMeasureEntity entity) {
        return UnitOfMeasureResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .abreviatura(entity.getAbreviatura())
                .build();
    }
}
