package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UnitOfMeasureRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UnitOfMeasureResponse;

import java.util.List;

/** Puerto de entrada para unidades de medida. */
public interface UnitOfMeasureService {

    List<UnitOfMeasureResponse> getAll();

    UnitOfMeasureResponse getById(Long id);

    UnitOfMeasureResponse create(UnitOfMeasureRequest request);

    UnitOfMeasureResponse update(Long id, UnitOfMeasureRequest request);

    void delete(Long id);
}