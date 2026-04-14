package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitOfMeasure {
    private Long id;
    private String name;
    private String abbreviation;
}
