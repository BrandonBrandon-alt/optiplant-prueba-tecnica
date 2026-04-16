package co.com.optiplant.inventario.transfer.domain.model;

import co.com.optiplant.inventario.transfer.domain.exception.InvalidTransferStateException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class Transfer {
    private Long id;
    private TransferStatus status;
    private LocalDateTime requestDate;
    private LocalDateTime estimatedArrivalDate;
    private LocalDateTime actualArrivalDate;
    private Long originBranchId;
    private Long destinationBranchId;
    private String carrier;
    private String receiptNotes;
    private List<TransferDetail> details;

    public Transfer(Long id, TransferStatus status, LocalDateTime requestDate, LocalDateTime estimatedArrivalDate, LocalDateTime actualArrivalDate, Long originBranchId, Long destinationBranchId, String carrier, String receiptNotes, List<TransferDetail> details) {
        if (originBranchId == null || destinationBranchId == null) {
            throw new IllegalArgumentException("Las sucursales de origen y destino son obligatorias.");
        }
        if (originBranchId.equals(destinationBranchId)) {
            throw new IllegalArgumentException("La sucursal de origen y destino no pueden ser la misma.");
        }
        if (details == null || details.isEmpty()) {
            throw new IllegalArgumentException("La transferencia debe tener al menos un producto.");
        }

        this.id = id;
        this.status = status != null ? status : TransferStatus.PENDING;
        this.requestDate = requestDate != null ? requestDate : LocalDateTime.now();
        this.estimatedArrivalDate = estimatedArrivalDate;
        this.actualArrivalDate = actualArrivalDate;
        this.originBranchId = originBranchId;
        this.destinationBranchId = destinationBranchId;
        this.carrier = carrier;
        this.receiptNotes = receiptNotes;
        this.details = details;
    }

    public static Transfer create(Long originBranchId, Long destinationBranchId, LocalDateTime estimatedArrival, List<TransferDetail> details) {
        return new Transfer(null, TransferStatus.PENDING, LocalDateTime.now(), estimatedArrival, null, originBranchId, destinationBranchId, null, null, details);
    }

    public void dispatch(String carrier) {
        if (this.status != TransferStatus.PENDING) {
            throw new InvalidTransferStateException("Solo se puede despachar una transferencia en estado PENDING.");
        }
        this.status = TransferStatus.IN_TRANSIT;
        this.carrier = carrier;
    }

    public void receive(String notes) {
        if (this.status != TransferStatus.IN_TRANSIT) {
            throw new InvalidTransferStateException("Solo se puede recibir una transferencia que está IN_TRANSIT.");
        }
        this.status = TransferStatus.DELIVERED;
        this.actualArrivalDate = LocalDateTime.now();
        this.receiptNotes = notes;
    }

    public void cancel() {
        if (this.status != TransferStatus.PENDING) {
            throw new InvalidTransferStateException("Solo se pueden cancelar transferencias en estado PENDING.");
        }
        this.status = TransferStatus.CANCELLED;
    }

    public Long getId() { return id; }
    public TransferStatus getStatus() { return status; }
    public LocalDateTime getRequestDate() { return requestDate; }
    public LocalDateTime getEstimatedArrivalDate() { return estimatedArrivalDate; }
    public LocalDateTime getActualArrivalDate() { return actualArrivalDate; }
    public Long getOriginBranchId() { return originBranchId; }
    public Long getDestinationBranchId() { return destinationBranchId; }
    public String getCarrier() { return carrier; }
    public String getReceiptNotes() { return receiptNotes; }
    public List<TransferDetail> getDetails() { return Collections.unmodifiableList(details); }
}
