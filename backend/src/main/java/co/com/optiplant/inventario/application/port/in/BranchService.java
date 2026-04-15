package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.BranchResponse;

import java.util.List;

/**
 * Puerto de entrada (driving port) para la gestión de sucursales.
 * Los controllers dependen de esta interfaz, nunca del UseCase concreto.
 */
public interface BranchService {

    List<BranchResponse> getAllBranches();

    BranchResponse getBranchById(Long id);
}