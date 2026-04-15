package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UserRequest;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.UserResponse;

import java.util.List;

/** Puerto de entrada para gestión de usuarios. */
public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);
}