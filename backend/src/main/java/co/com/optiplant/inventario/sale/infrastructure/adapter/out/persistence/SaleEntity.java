package co.com.optiplant.inventario.sale.infrastructure.adapter.out.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
public class SaleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime date;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "sucursal_id", nullable = false)
    private Long branchId;

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleDetailEntity> details = new ArrayList<>();

    public SaleEntity() {}

    public void addDetail(SaleDetailEntity detail) {
        details.add(detail);
        detail.setSale(this);
    }

    public void removeDetail(SaleDetailEntity detail) {
        details.remove(detail);
        detail.setSale(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<SaleDetailEntity> getDetails() { return details; }
    public void setDetails(List<SaleDetailEntity> details) { this.details = details; }
}
