package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SaleResponse;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Puerto de entrada para registro y consulta de ventas.
 */
public interface SaleService {

    Long registerSale(SaleRequest request);

    List<SaleResponse> getAllSales();

    SaleResponse getSaleById(Long id);

    List<SaleResponse> getSalesByBranch(Long branchId, LocalDateTime from, LocalDateTime to);
}