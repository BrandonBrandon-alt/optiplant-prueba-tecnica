package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.RoleRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.RoleResponse;

import java.util.List;

/** Puerto de entrada para gestión de roles. */
public interface RoleService {

    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(Long id);

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(Long id, RoleRequest request);

    void deleteRole(Long id);
}