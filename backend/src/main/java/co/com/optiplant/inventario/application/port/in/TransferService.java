package co.com.optiplant.inventario.application.port.in;

import co.com.optiplant.inventario.infrastructure.adapter.in.web.dto.TransferRequest;

/**
 * Puerto de entrada para el ciclo de vida de transferencias entre sucursales.
 */
public interface TransferService {

    Long requestTransfer(TransferRequest request);

    void dispatchTransfer(Long transferId, Long responsibleUserId);

    void receiveTransfer(Long transferId, Long responsibleUserId);
}