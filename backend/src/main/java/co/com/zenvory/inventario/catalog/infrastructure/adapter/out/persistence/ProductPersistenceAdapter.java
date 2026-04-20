package co.com.zenvory.inventario.catalog.infrastructure.adapter.out.persistence;

import co.com.zenvory.inventario.catalog.application.port.out.ProductRepositoryPort;
import co.com.zenvory.inventario.catalog.domain.model.Product;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adaptador de salida (Output Adapter) que implementa
 * {@link ProductRepositoryPort}
 * usando Spring Data JPA.
 *
 * <p>
 * Su única responsabilidad es traducir entre el modelo de dominio
 * ({@link Product})
 * y la entidad de persistencia ({@link ProductEntity}), delegando las
 * operaciones
 * CRUD al repositorio JPA.
 * </p>
 *
 * <p>
 * Si en el futuro se necesita cambiar la tecnología de persistencia (ej:
 * MongoDB),
 * solo se reemplaza esta clase, sin tocar el dominio ni la aplicación.
 * </p>
 */
@Component
public class ProductPersistenceAdapter implements ProductRepositoryPort {

    private final JpaProductRepository jpaRepository;
    private final JpaSupplierRepository supplierRepository;

    public ProductPersistenceAdapter(JpaProductRepository jpaRepository, JpaSupplierRepository supplierRepository) {
        this.jpaRepository = jpaRepository;
        this.supplierRepository = supplierRepository;
    }

    /** {@inheritDoc} */
    @Override
    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return jpaRepository.findAll().stream()
                .map(ProductEntity::toDomain)
                .collect(Collectors.toList());
    }

    /** {@inheritDoc} */
    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findById(Long id) {
        return jpaRepository.findById(id)
                .map(ProductEntity::toDomain);
    }

    /** {@inheritDoc} */
    @Override
    public boolean existsBySku(String sku) {
        return jpaRepository.existsBySku(sku);
    }

    @Override
    @Transactional
    public Product save(Product product) {
        // 1. Obtener o preparar la entidad base
        ProductEntity entity;
        boolean isNew = product.getId() == null;

        if (!isNew) {
            entity = jpaRepository.findById(product.getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + product.getId()));

            // Actualizar campos básicos
            entity.setSku(product.getSku());
            entity.setName(product.getName());
            entity.setAverageCost(product.getAverageCost());
            entity.setSalePrice(product.getSalePrice());
            entity.setUnit(
                    product.getUnitId() != null ? UnitOfMeasureEntity.builder().id(product.getUnitId()).build() : null);
            entity.setActive(product.getActive());
        } else {
            entity = ProductEntity.fromDomain(product);
            entity.setCreatedAt(java.time.LocalDateTime.now());
            if (entity.getSuppliers() == null) {
                entity.setSuppliers(new java.util.ArrayList<>());
            }
            // Guardar para generar ID antes de asociar proveedores (necesario por productId
            // no nulo)
            entity = jpaRepository.save(entity);
        }

        // 2. Sincronizar proveedores desde los detalles del dominio
        if (product.getSuppliersDetails() != null && !product.getSuppliersDetails().isEmpty()) {

            // A. Crear un Map rápido de los datos que vienen del dominio (por ID de
            // proveedor)
            java.util.Map<Long, co.com.zenvory.inventario.catalog.domain.model.ProductSupplierDetail> incomingDetails = product
                    .getSuppliersDetails().stream()
                    .collect(java.util.stream.Collectors.toMap(
                            co.com.zenvory.inventario.catalog.domain.model.ProductSupplierDetail::supplierId,
                            detail -> detail));

            // B. Recorrer la lista actual de la base de datos para actualizar o borrar
            java.util.Iterator<ProductSupplierEntity> iterator = entity.getSuppliers().iterator();
            while (iterator.hasNext()) {
                ProductSupplierEntity existingRelation = iterator.next();
                Long existingSupplierId = existingRelation.getSupplierId();

                if (incomingDetails.containsKey(existingSupplierId)) {
                    // CASO 1: El proveedor ya existía. ACTUALIZAMOS sus datos.
                    var incomingDetail = incomingDetails.get(existingSupplierId);
                    existingRelation.setNegotiatedPrice(incomingDetail.negotiatedPrice());
                    existingRelation.setDeliveryDays(incomingDetail.deliveryDays());
                    existingRelation.setPreferred(incomingDetail.preferred());

                    // Lo sacamos del Map porque ya lo procesamos
                    incomingDetails.remove(existingSupplierId);
                } else {
                    // CASO 2: El proveedor estaba en BD pero ya no viene en la petición. BORRAMOS.
                    iterator.remove();
                }
            }

            // C. Lo que quedó en el Map son proveedores NUEVOS. INSERTAMOS.
            for (co.com.zenvory.inventario.catalog.domain.model.ProductSupplierDetail newDetail : incomingDetails
                    .values()) {
                SupplierEntity supplierRef = supplierRepository.getReferenceById(newDetail.supplierId());

                ProductSupplierEntity newRelation = ProductSupplierEntity.builder()
                        .product(entity)
                        .productId(entity.getId())
                        .supplier(supplierRef)
                        .supplierId(newDetail.supplierId())
                        .negotiatedPrice(newDetail.negotiatedPrice() != null ? newDetail.negotiatedPrice()
                                : java.math.BigDecimal.ZERO)
                        .deliveryDays(newDetail.deliveryDays() != null ? newDetail.deliveryDays() : 0)
                        .preferred(newDetail.preferred() != null ? newDetail.preferred() : false)
                        .build();

                entity.getSuppliers().add(newRelation);
            }

        } else {
            // Si la petición viene sin proveedores, limpiamos todo
            if (entity.getSuppliers() != null) {
                entity.getSuppliers().clear();
            }
        }

        // 3. Guardar cambios finales (relaciones) y retornar
        return jpaRepository.save(entity).toDomain();
    }

    /** {@inheritDoc} */
    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
