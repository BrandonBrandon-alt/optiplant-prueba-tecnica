package co.com.optiplant.inventario.branch.domain.model;

import lombok.*;
import java.time.LocalDateTime;

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
    private Boolean active;
    private LocalDateTime createdAt;
}