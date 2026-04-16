"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

type TransferResponse = components["schemas"]["TransferResponse"];
type ProductResponse = components["schemas"]["ProductResponse"];

interface ReceiveTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transfer: TransferResponse | null;
  userId: number | null;
}

export default function ReceiveTransferModal({ open, onClose, onSuccess, transfer, userId }: ReceiveTransferModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Map<number, string>>(new Map());
  const [receivedQuantities, setReceivedQuantities] = useState<{ [key: number]: number }>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && transfer) {
      // Initialize received quantities with sent quantities
      const initial: { [key: number]: number } = {};
      transfer.details?.forEach(d => {
        initial[d.id!] = d.sentQuantity || d.requestedQuantity || 0;
      });
      setReceivedQuantities(initial);
      setNotes("");

      // Fetch products to show names
      apiClient.GET("/api/catalog/products").then(res => {
        setProducts(new Map((res.data ?? []).map(p => [p.id!, p.nombre!])));
      });
    }
  }, [open, transfer]);

  const handleQuantityChange = (detailId: number, val: string) => {
    const num = parseInt(val) || 0;
    setReceivedQuantities({ ...receivedQuantities, [detailId]: num });
  };

  const handleSubmit = async () => {
    if (!transfer || !userId) return;

    setLoading(true);
    try {
      await (apiClient as any).POST("/api/v1/transfers/{id}/receive", {
        params: { path: { id: transfer.id! } },
        body: {
          userId,
          notes,
          items: Object.entries(receivedQuantities).map(([id, qty]) => ({
            detailId: parseInt(id),
            receivedQuantity: qty,
          })),
        },
      });

      showToast("Recepción registrada correctamente", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast("Error al registrar la recepción", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!transfer) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Recibir Traslado #${transfer.id}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontSize: "13px", color: "var(--neutral-400)" }}>
          Confirma la recepción física de los productos. Si llegó menos de lo enviado, ingresa la cantidad real; el sistema generará una alerta por el faltante automáticamente.
        </p>

        <div style={{ overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={headerStyle}>Producto</th>
                <th style={headerStyle}>Enviado</th>
                <th style={headerStyle}>Recibido</th>
              </tr>
            </thead>
            <tbody>
              {transfer.details?.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={cellStyle}>{products.get(d.productId!) || `ID: ${d.productId}`}</td>
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: 600 }}>{d.sentQuantity || d.requestedQuantity}</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="number"
                      min="0"
                      max={d.sentQuantity || d.requestedQuantity}
                      value={receivedQuantities[d.id!] || 0}
                      onChange={(e) => handleQuantityChange(d.id!, e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Input
          label="Observaciones / Novedades"
          placeholder="Escribe aquí si hubo algún problema con la entrega..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading}>
            Confirmar Recepción
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
