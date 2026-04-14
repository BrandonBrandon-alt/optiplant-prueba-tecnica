package co.com.optiplant.inventario.application.usecase;

import co.com.optiplant.inventario.domain.exception.ResourceNotFoundException;
import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.SupplierResponse;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.entity.SupplierEntity;
import co.com.optiplant.inventario.infrastructure.adapter.out.persistence.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierUseCase {

    private final SupplierRepository supplierRepository;

    public SupplierUseCase(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", "ID", id));
        return mapToResponse(supplier);
    }

    private SupplierResponse mapToResponse(SupplierEntity entity) {
        return SupplierResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .contacto(entity.getContacto())
                .tiempoEntregaDias(entity.getTiempoEntregaDias())
                .build();
    }
}
