package co.com.optiplant.inventario.sale.application.port.in;

import co.com.optiplant.inventario.sale.domain.model.Sale;

public interface CreateSaleUseCase {
    Sale execute(CreateSaleCommand command);
}
