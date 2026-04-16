"use client";

import React, { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/api/client";
import { 
  User, 
  Store, 
  Calendar, 
  Hash, 
  Printer, 
  AlertTriangle,
  Package,
  CreditCard
} from "lucide-react";
import SaleReceipt from "./SaleReceipt";

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any | null;
  isAdmin: boolean;
  onSaleCanceled?: () => void;
}

export default function SaleDetailModal({
  isOpen,
  onClose,
  sale,
  isAdmin,
  onSaleCanceled,
}: SaleDetailModalProps) {
  const { showToast } = useToast();
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!sale) return null;

  const handleCancelSale = async () => {
    if (!cancelReason.trim()) {
      showToast("Ingrese el motivo de la anulación.", "warning");
      return;
    }

    setIsCanceling(true);
    try {
      await apiClient.DELETE("/api/v1/sales/{id}", { 
        params: { 
          path: { id: sale.id },
          query: { reason: cancelReason } 
        } 
      });
      showToast("Venta anulada correctamente.", "success");
      onSaleCanceled?.();
      onClose();
    } catch (error: any) {
      showToast("Error al procesar la anulación.", "error");
    } finally {
      setIsCanceling(false);
      setShowCancelConfirm(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Auditoría de Venta"
      description={`Referencia ERP: #${sale.id}`}
      width="550px"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Status Indicator - Minimalist */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sale.status === 'COMPLETED' ? "var(--color-success)" : "var(--color-danger)" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--neutral-400)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {sale.status === 'COMPLETED' ? "Transacción Exitosa" : "Operación Anulada"}
                </span>
            </div>
            {sale.status === 'CANCELLED' && (
                <span style={{ fontSize: "11px", color: "var(--color-danger)", fontWeight: 600 }}>ID: 00{sale.id}</span>
            )}
        </div>

        {/* Core Metrics Grid - Solid style */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <MetricBox icon={<Calendar size={14} />} label="Fecha" value={new Date(sale.date).toLocaleDateString("es-CO", { day: '2-digit', month: 'short', year: 'numeric' })} />
            <MetricBox icon={<Store size={14} />} label="Sucursal" value={sale.branchName || "Sede Central"} />
            <MetricBox icon={<User size={14} />} label="Vendedor" value={sale.userName || "Admin"} />
            <MetricBox icon={<Hash size={14} />} label="Registro" value={`POS-${sale.id}`} />
        </div>

        {/* Customer Info */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "16px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Responsable / Cliente</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--neutral-100)", textTransform: "uppercase" }}>{sale.customerName || "Venta General"}</p>
            <p className="tabular" style={{ fontSize: "12px", color: "var(--neutral-500)", marginTop: "2px" }}>DNI: {sale.customerDocument || "No registrado"}</p>
        </div>

        {/* Itemized Table - High Density */}
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent" }}>
                <thead style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-default)" }}>
                    <tr>
                        <th style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", textAlign: "left" }}>Item</th>
                        <th style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", textAlign: "center" }}>Cant.</th>
                        <th style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", textAlign: "right" }}>Total</th>
                    </tr>
                </thead>
                <tbody style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    {sale.details?.map((detail: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "12px 16px" }}>
                                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--neutral-100)", textTransform: "uppercase" }}>{detail.productName || "Producto"}</p>
                                <p style={{ fontSize: "11px", color: "var(--neutral-500)" }}>{formatCurrency(detail.unitPriceApplied)} c/u</p>
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                <span className="tabular" style={{ fontSize: "13px", fontWeight: 600, color: "var(--neutral-400)" }}>{detail.quantity}</span>
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                <span className="tabular" style={{ fontSize: "13px", fontWeight: 700, color: "var(--neutral-100)" }}>
                                    {formatCurrency(detail.subtotalLine)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Financial Recap - Minimalist */}
        <div style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Total de Operación</p>
                    <p className="tabular" style={{ fontSize: "32px", fontWeight: 800, color: "var(--brand-400)", letterSpacing: "-0.04em" }}>{formatCurrency(sale.totalFinal)}</p>
                </div>
                <div style={{ textAlign: "right", opacity: 0.4 }}>
                    <CreditCard size={24} style={{ color: "var(--neutral-600)" }} />
                </div>
            </div>
        </div>

        {/* Actions Selection */}
        {!showCancelConfirm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "16px", borderTop: "1px solid var(--border-default)" }}>
                <Button variant="ghost" fullWidth onClick={handlePrint} leftIcon={<Printer size={16} />}>
                    Imprimir Comprobante
                </Button>
                {isAdmin && sale.status === 'COMPLETED' && (
                    <Button variant="danger" fullWidth onClick={() => setShowCancelConfirm(true)} leftIcon={<AlertTriangle size={16} />}>
                        Anular Transacción
                    </Button>
                )}
            </div>
        ) : (
            <div style={{ padding: "20px", background: "rgba(224, 112, 112, 0.05)", border: "1px solid rgba(224, 112, 112, 0.1)", borderRadius: "var(--radius-md)", marginTop: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-danger)", marginBottom: "12px" }}>Motivo de la anulación</p>
                <textarea 
                    style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "12px", color: "white", fontSize: "13px", outline: "none", minHeight: "80px", marginBottom: "12px" }}
                    placeholder="Escriba el motivo aquí..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                    <Button fullWidth variant="danger" loading={isCanceling} onClick={handleCancelSale}>Confirmar</Button>
                    <Button fullWidth variant="ghost" onClick={() => setShowCancelConfirm(false)}>Cerrar</Button>
                </div>
            </div>
        )}

        {/* Hidden area for Receipt Printing */}
        <div className="hidden">
           <div id="print-area">
              <SaleReceipt sale={sale} />
           </div>
        </div>
      </div>
    </Drawer>
  );
}

function MetricBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "12px 16px", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", opacity: 0.6 }}>
                <span style={{ color: "var(--neutral-500)" }}>{icon}</span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--neutral-100)", textTransform: "uppercase" }}>{value}</p>
        </div>
    );
}
