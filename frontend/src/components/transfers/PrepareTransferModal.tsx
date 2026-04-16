"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

type TransferResponse = components["schemas"]["TransferResponse"];
type ProductResponse = components["schemas"]["ProductResponse"];

interface PrepareTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transfer: TransferResponse | null;
}

export default function PrepareTransferModal({ open, onClose, onSuccess, transfer }: PrepareTransferModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState<{ [key: number]: number }>({});
  const [products, setProducts] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (open && transfer) {
      const fetchStockAndProducts = async () => {
        try {
          const pRes = await apiClient.GET("/api/catalog/products");
          const productMap = new Map((pRes.data ?? []).map(p => [p.id!, p.nombre!]));
          setProducts(productMap);

          const stockMap: { [key: number]: number } = {};
          await Promise.all((transfer.details ?? []).map(async (d) => {
            const invRes = await apiClient.GET("/api/v1/inventory/branches/{branchId}/products/{productId}", {
              params: { path: { branchId: transfer.originBranchId!, productId: d.productId! } }
            });
            stockMap[d.productId!] = (invRes.data as any)?.currentQuantity || 0;
          }));
          setStockInfo(stockMap);
        } catch (err) {
          showToast("Error al cargar disponibilidad de stock", "error");
        }
      };
      fetchStockAndProducts();
    }
  }, [open, transfer, showToast]);

  const handleSubmit = async () => {
    if (!transfer) return;
    setLoading(true);
    try {
      await (apiClient as any).POST("/api/v1/transfers/{id}/prepare", {
        params: { path: { id: transfer.id! } },
        body: {
          items: transfer.details?.map(d => ({
            productId: d.productId,
            requestedQuantity: d.requestedQuantity
          }))
        }
      });
      showToast("Traslado en preparación", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast("Error al iniciar preparación", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!transfer) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Preparar Envío - Traslado #${transfer.id}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontSize: "14px", color: "var(--neutral-300)" }}>
          Evalúa la disponibilidad de los productos solicitados antes de proceder con el despacho.
        </p>

        <div style={{ borderRadius: "12px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Pedido</th>
                <th style={thStyle}>En Stock</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {transfer.details?.map(d => {
                const stock = stockInfo[d.productId!] || 0;
                const isShort = stock < (d.requestedQuantity || 0);
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={tdStyle}>{products.get(d.productId!) || `ID: ${d.productId}`}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{d.requestedQuantity}</td>
                    <td style={tdStyle}>{stock}</td>
                    <td style={tdStyle}>
                      {isShort ? (
                        <span style={{ color: "var(--color-danger)", fontSize: "12px", fontWeight: 600 }}>Insuficiente</span>
                      ) : (
                        <span style={{ color: "var(--color-success)", fontSize: "12px", fontWeight: 600 }}>Disponible</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Object.values(stockInfo).some((s, idx) => s < (transfer.details?.[idx]?.requestedQuantity || 0)) && (
          <div style={{ padding: "12px", background: "rgba(224,112,112,0.1)", borderRadius: "8px", border: "1px solid rgba(224,112,112,0.2)" }}>
            <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>
              ⚠️ Tienes menos stock del solicitado en algunos ítems. Podrás ajustar la cantidad real enviada en el siguiente paso (Despacho).
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading}>
            Aprobar Preparación
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const thStyle = { padding: "12px", textAlign: "left" as const, fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" as const };
const tdStyle = { padding: "12px", fontSize: "14px", color: "var(--neutral-100)" };
