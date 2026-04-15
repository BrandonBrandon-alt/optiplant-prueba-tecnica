package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.ProductUnitRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.ProductUnitResponse;

import java.util.List;

/**
 * Puerto de entrada para gestión de presentaciones (unidades) de un producto.
 */
public interface ProductUnitService {

    List<ProductUnitResponse> getByProductId(Long productId);

    ProductUnitResponse assignUnit(ProductUnitRequest request);

    ProductUnitResponse update(Long id, ProductUnitRequest request);

    void delete(Long id);
}