package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.LogisticRouteRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.LogisticRouteResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.BranchEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.LogisticRouteEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.BranchRepository;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.LogisticRouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LogisticRouteUseCase {

    private final LogisticRouteRepository routeRepository;
    private final BranchRepository branchRepository;

    public LogisticRouteUseCase(LogisticRouteRepository routeRepository,
                                BranchRepository branchRepository) {
        this.routeRepository = routeRepository;
        this.branchRepository = branchRepository;
    }

    /** Lista todas las rutas logísticas registradas. */
    @Transactional(readOnly = true)
    public List<LogisticRouteResponse> getAll() {
        return routeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Lista las rutas que parten desde una sucursal origen específica. */
    @Transactional(readOnly = true)
    public List<LogisticRouteResponse> getByOrigin(Long originBranchId) {
        return routeRepository.findBySucursalOrigenId(originBranchId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Obtiene el detalle de una ruta por ID. */
    @Transactional(readOnly = true)
    public LogisticRouteResponse getById(Long id) {
        return mapToResponse(
                routeRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Ruta Logística", "ID", id))
        );
    }

    /**
     * Crea una nueva ruta logística entre dos sucursales diferentes.
     * Valida que el par origen-destino no exista ya (restricción UNIQUE de la tabla).
     */
    @Transactional
    public LogisticRouteResponse create(LogisticRouteRequest request) {
        if (request.getSucursalOrigenId().equals(request.getSucursalDestinoId())) {
            throw new IllegalArgumentException("La sucursal origen y destino no pueden ser la misma.");
        }

        routeRepository.findBySucursalOrigenIdAndSucursalDestinoId(
                request.getSucursalOrigenId(), request.getSucursalDestinoId()
        ).ifPresent(existing -> {
            throw new IllegalArgumentException(
                    "Ya existe una ruta entre la sucursal " + request.getSucursalOrigenId() +
                    " y la sucursal " + request.getSucursalDestinoId()
            );
        });

        BranchEntity origin = branchRepository.findById(request.getSucursalOrigenId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getSucursalOrigenId()));

        BranchEntity dest = branchRepository.findById(request.getSucursalDestinoId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal", "ID", request.getSucursalDestinoId()));

        LogisticRouteEntity entity = LogisticRouteEntity.builder()
                .sucursalOrigen(origin)
                .sucursalDestino(dest)
                .tiempoEstimadoHoras(request.getTiempoEstimadoHoras())
                .costoFleteEstimado(request.getCostoFleteEstimado())
                .build();

        return mapToResponse(routeRepository.save(entity));
    }

    /**
     * Actualiza el tiempo estimado y/o el costo de flete de una ruta existente.
     * No permite cambiar origen/destino (eso sería una ruta diferente).
     */
    @Transactional
    public LogisticRouteResponse update(Long id, LogisticRouteRequest request) {
        LogisticRouteEntity entity = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ruta Logística", "ID", id));

        entity.setTiempoEstimadoHoras(request.getTiempoEstimadoHoras());
        entity.setCostoFleteEstimado(request.getCostoFleteEstimado());

        return mapToResponse(routeRepository.save(entity));
    }

    /** Elimina una ruta logística. */
    @Transactional
    public void delete(Long id) {
        if (!routeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ruta Logística", "ID", id);
        }
        routeRepository.deleteById(id);
    }

    private LogisticRouteResponse mapToResponse(LogisticRouteEntity entity) {
        return LogisticRouteResponse.builder()
                .id(entity.getId())
                .sucursalOrigenId(entity.getSucursalOrigen().getId())
                .sucursalOrigenNombre(entity.getSucursalOrigen().getNombre())
                .sucursalDestinoId(entity.getSucursalDestino().getId())
                .sucursalDestinoNombre(entity.getSucursalDestino().getNombre())
                .tiempoEstimadoHoras(entity.getTiempoEstimadoHoras())
                .costoFleteEstimado(entity.getCostoFleteEstimado())
                .build();
    }
}
