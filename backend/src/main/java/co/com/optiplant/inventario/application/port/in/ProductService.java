package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.domain.model.Product;

import java.util.List;

/**
 * Puerto de entrada para consulta de productos.
 */
public interface ProductService {

    List<Product> getAllProducts();

    Product getProductBySku(String sku);
}