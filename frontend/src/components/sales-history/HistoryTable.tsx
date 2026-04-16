"use client";

import React from "react";
import { Eye, AlertCircle } from "lucide-react";

interface HistoryTableProps {
  sales: any[];
  onOpenDetail: (sale: any) => void;
  formatCurrency: (amount: number) => string;
  onRefresh: () => void;
}

export default function HistoryTable({ sales, onOpenDetail, formatCurrency, onRefresh }: HistoryTableProps) {
  if (sales.length === 0) {
    return (
      <div style={{ padding: "80px 32px", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--neutral-800)", margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--neutral-400)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>
          Sin registros encontrados
        </h3>
        <p style={{ color: "var(--neutral-600)", fontSize: "12px", maxWidth: "280px", margin: "0 auto 24px" }}>
          No hay transacciones que coincidan con los filtros aplicados en esta sucursal.
        </p>
        <button 
          onClick={onRefresh} 
          style={{ background: "none", border: "none", color: "var(--brand-400)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer" }}
        >
          Refrescar base de datos
        </button>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Desktop Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
        <thead>
          <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
            <th style={thStyle}>ID / Referencia</th>
            <th style={thStyle}>Sucursal / Usuario</th>
            <th style={thStyle}>Cliente / Identificación</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Inversión Final</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Estado</th>
            <th style={{ ...thStyle, textAlign: "right", width: "80px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr 
              key={sale.id} 
              style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => onOpenDetail(sale)}
              className="group cursor-pointer"
            >
              <td style={{ padding: "16px" }}>
                <span className="tabular" style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-400)" }}>
                  #{sale.id}
                </span>
              </td>
              <td style={{ padding: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--neutral-100)", textTransform: "uppercase" }}>
                    {sale.branchName || `Sucursal ${sale.branchId}`}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--neutral-500)", fontWeight: 500 }}>
                    {sale.userName || "Admin Central"}
                  </span>
                </div>
              </td>
              <td style={{ padding: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--neutral-100)", textTransform: "uppercase" }}>
                    {sale.customerName || "Venta General"}
                  </span>
                  <span className="tabular" style={{ fontSize: "11px", color: "var(--neutral-500)", fontWeight: 500 }}>
                    ID: {sale.customerDocument || "N/A"}
                  </span>
                </div>
              </td>
              <td style={{ padding: "16px", textAlign: "right" }}>
                <span className="tabular" style={{ fontSize: "16px", fontWeight: 800, color: "var(--neutral-50)" }}>
                  {formatCurrency(sale.totalFinal)}
                </span>
              </td>
              <td style={{ padding: "16px", textAlign: "center" }}>
                <div style={{ 
                    display: "inline-flex", 
                    padding: "2px 8px", 
                    borderRadius: "4px", 
                    fontSize: "10px", 
                    fontWeight: 700, 
                    textTransform: "uppercase",
                    background: sale.status === 'COMPLETED' ? "rgba(111, 191, 138, 0.1)" : "rgba(224, 112, 112, 0.1)",
                    color: sale.status === 'COMPLETED' ? "var(--color-success)" : "var(--color-danger)",
                    border: `1px solid ${sale.status === 'COMPLETED' ? "rgba(111, 191, 138, 0.2)" : "rgba(224, 112, 112, 0.2)"}`
                }}>
                  {sale.status === 'COMPLETED' ? "Aprobada" : "Anulada"}
                </div>
              </td>
              <td style={{ padding: "16px", textAlign: "right" }}>
                <button style={{ background: "none", border: "none", color: "var(--neutral-600)", cursor: "pointer" }} className="group-hover:text-neutral-200 transition-colors">
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {sales.map((sale) => (
          <div 
            key={sale.id} 
            style={{ padding: "20px", background: "var(--bg-base)", borderBottom: "1px solid var(--border-subtle)" }}
            onClick={() => onOpenDetail(sale)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span className="tabular" style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-400)" }}>#{sale.id}</span>
              <div style={{ 
                  padding: "2px 6px", 
                  borderRadius: "4px", 
                  fontSize: "9px", 
                  fontWeight: 700, 
                  textTransform: "uppercase",
                  background: sale.status === 'COMPLETED' ? "rgba(111, 191, 138, 0.1)" : "rgba(224, 112, 112, 0.1)",
                  color: sale.status === 'COMPLETED' ? "var(--color-success)" : "var(--color-danger)",
              }}>
                {sale.status === 'COMPLETED' ? "Aprobada" : "Anulada"}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "10px", color: "var(--neutral-500)", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>Cliente</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--neutral-100)", textTransform: "uppercase" }}>{sale.customerName || "Gral."}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "10px", color: "var(--neutral-500)", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>Total</p>
                <p className="tabular" style={{ fontSize: "14px", fontWeight: 800, color: "var(--neutral-50)" }}>{formatCurrency(sale.totalFinal)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { 
    padding: "16px", 
    fontSize: "12px", 
    color: "var(--neutral-500)", 
    textTransform: "uppercase", 
    fontWeight: 600, 
    letterSpacing: "1px" 
};
