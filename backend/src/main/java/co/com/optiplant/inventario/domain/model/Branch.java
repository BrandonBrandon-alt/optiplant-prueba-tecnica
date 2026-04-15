package co.com.optiplant.inventario.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// Reemplazamos @Data por @Getter y @Setter
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Branch {
    private Long id;
    private String name;
    private String address;
    private String phone;

    // Cambiado de boolean (minúscula) a Boolean (Mayúscula)
    // Ahora sí existirá el método branch.getActive()
    private Boolean active;

    private LocalDateTime createdAt;
}