package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.LogisticRouteRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.LogisticRouteResponse;

import java.util.List;

/** Puerto de entrada para rutas logísticas entre sucursales. */
public interface LogisticRouteService {

    List<LogisticRouteResponse> getAll();

    List<LogisticRouteResponse> getByOrigin(Long originBranchId);

    LogisticRouteResponse getById(Long id);

    LogisticRouteResponse create(LogisticRouteRequest request);

    LogisticRouteResponse update(Long id, LogisticRouteRequest request);

    void delete(Long id);
}