"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

type TransferResponse = components["schemas"]["TransferResponse"];

interface DispatchTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transfer: TransferResponse | null;
  userId: number | null;
}

export default function DispatchTransferModal({ open, onClose, onSuccess, transfer, userId }: DispatchTransferModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Map<number, string>>(new Map());
  const [carrier, setCarrier] = useState("");
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState("");
  const [sentQuantities, setSentQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (open && transfer) {
      // Initialize sent quantities with requested quantities
      const initial: { [key: number]: number } = {};
      transfer.details?.forEach(d => {
        initial[d.id!] = d.requestedQuantity || 0;
      });
      setSentQuantities(initial);
      setCarrier("");
      setEstimatedArrivalDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);

      // Fetch products to show names
      apiClient.GET("/api/catalog/products").then(res => {
        setProducts(new Map((res.data ?? []).map(p => [p.id!, p.nombre!])));
      });
    }
  }, [open, transfer]);

  const handleQuantityChange = (detailId: number, val: string) => {
    const num = parseInt(val) || 0;
    setSentQuantities({ ...sentQuantities, [detailId]: num });
  };

  const handleSubmit = async () => {
    if (!transfer || !userId || !carrier) {
      showToast("Por favor ingresa el transportista", "warning");
      return;
    }

    setLoading(true);
    try {
      await (apiClient as any).POST("/api/v1/transfers/{id}/dispatch", {
        params: { path: { id: transfer.id! } },
        body: {
          userId,
          carrier,
          items: Object.entries(sentQuantities).map(([id, qty]) => ({
            detailId: parseInt(id),
            sentQuantity: qty,
          })),
        },
      });

      showToast("Traslado despachado correctamente", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast("Error al despachar el traslado", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!transfer) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Despachar/Preparar Traslado #${transfer.id}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontSize: "13px", color: "var(--neutral-400)" }}>
          Confirma las cantidades finales a enviar y registra el transportista responsable. 
          Si no tienes stock suficiente, puedes ajustar la cantidad a enviar.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label="Transportista"
            placeholder="Empresa o conductor"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            required
          />
          <Input
            label="Fecha Est. de Llegada"
            type="date"
            value={estimatedArrivalDate}
            onChange={(e) => setEstimatedArrivalDate(e.target.value)}
            required
          />
        </div>

        <div style={{ overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={headerStyle}>Producto</th>
                <th style={headerStyle}>Solicitado</th>
                <th style={headerStyle}>A Enviar</th>
              </tr>
            </thead>
            <tbody>
              {transfer.details?.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={cellStyle}>{products.get(d.productId!) || `ID: ${d.productId}`}</td>
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: 600 }}>{d.requestedQuantity}</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="number"
                      min="0"
                      max={d.requestedQuantity}
                      value={sentQuantities[d.id!] || 0}
                      onChange={(e) => handleQuantityChange(d.id!, e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading}>
            Confirmar Despacho
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const headerStyle = {
  padding: "10px 12px",
  textAlign: "left" as const,
  fontSize: "12px",
  color: "var(--neutral-500)",
};

const cellStyle = {
  padding: "10px 12px",
  color: "var(--neutral-100)",
};

const inputStyle = {
  width: "100%",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid var(--border-default)",
  background: "var(--bg-base)",
  color: "var(--neutral-100)",
  textAlign: "center" as const,
  fontWeight: 700,
  fontSize: "14px",
};
