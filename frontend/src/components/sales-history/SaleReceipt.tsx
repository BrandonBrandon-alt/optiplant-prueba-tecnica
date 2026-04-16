"use client";

import React from "react";

interface SaleReceiptProps {
  sale: {
    id: number;
    date: string;
    subtotal: number;
    totalDiscount: number;
    totalFinal: number;
    branchName?: string | null;
    userName?: string | null;
    customerName?: string | null;
    customerDocument?: string | null;
    details: Array<{
      id: number;
      productId: number;
      productName?: string | null;
      quantity: number;
      unitPriceApplied: number;
      discountPercentage: number;
      subtotalLine: number;
    }>;
  };
}

export default function SaleReceipt({ sale }: SaleReceiptProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

  return (
    <div style={styles.container}>
      <style>{printStyles}</style>

      {/* ── Visual Wrapper (Screen & Print) ── */}
      <div className="printable-receipt" style={styles.receipt}>
        
        {/* Header - Brand First */}
        <div style={styles.header}>
          <h1 style={styles.title}>OPTIPLANT</h1>
          <p style={styles.subtitle}>SISTEMAS AGROINDUSTRIALES</p>
          <div style={styles.dotSeparator} />
          <div style={styles.bizDetails}>
            NIT: 900.123.456-1<br />
            {sale.branchName || "Sede Principal"}<br />
            Tel: (604) 444-0000
          </div>
          <div style={styles.invoiceNumber}>
            FACTURA DE VENTA N° {sale.id}
          </div>
        </div>

        {/* Info Grid */}
        <div style={styles.section}>
          <div style={styles.grid}>
            <div style={styles.gridItem}>
                <span style={styles.label}>Fecha</span>
                <span style={styles.value}>{formatDate(sale.date)}</span>
            </div>
            <div style={styles.gridItem}>
                <span style={styles.label}>Hora</span>
                <span style={styles.value}>{formatTime(sale.date)}</span>
            </div>
            <div style={{ ...styles.gridItem, gridColumn: "span 2", marginTop: "8px" }}>
                <span style={styles.label}>Atendido por</span>
                <span style={styles.value}>{sale.userName || "Operador"}</span>
            </div>
          </div>
        </div>

        {/* Customer Block */}
        <div style={styles.customerSection}>
          <span style={styles.label}>Cliente / NIT</span>
          <div style={styles.customerName}>{sale.customerName || "Venta General (Público)"}</div>
          <div style={styles.customerDoc}>{sale.customerDocument || "No Identificado"}</div>
        </div>

        <div style={styles.divider} />

        {/* Item Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ ...styles.th, textAlign: "left" }}>Descripción</th>
              <th style={{ ...styles.th, textAlign: "center", width: "40px" }}>Cant</th>
              <th style={{ ...styles.th, textAlign: "right", width: "80px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.details?.map((detail) => (
              <tr key={detail.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.itemName}>{detail.productName || "Producto"}</div>
                  <div style={styles.itemPrice}>{formatCurrency(detail.unitPriceApplied)} c/u</div>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                   <span className="tabular">{detail.quantity}</span>
                </td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                   <span className="tabular" style={styles.boldValue}>{formatCurrency(detail.subtotalLine)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span>Subtotal</span>
            <span className="tabular">{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.totalDiscount > 0 && (
            <div style={{ ...styles.summaryRow, color: "var(--color-danger)" }}>
              <span>Descuento</span>
              <span className="tabular">-{formatCurrency(sale.totalDiscount)}</span>
            </div>
          )}
          <div style={styles.totalFinal}>
            <span style={styles.totalFinalLabel}>Valor Total</span>
            <span className="tabular" style={styles.totalFinalAmount}>{formatCurrency(sale.totalFinal)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerThanks}>GRACIAS POR SU COMPRA</p>
          <div style={styles.dotSeparator} />
          <p style={styles.footerLegal}>
            Documento equivalente a factura de venta.<br />
            Favor verificar su mercancía.<br />
            Software: OptiPlant ERP v2.0
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "40px 0",
    display: "flex",
    justifyContent: "center",
    background: "transparent",
  },
  receipt: {
    width: "350px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    borderRadius: "16px",
    padding: "32px",
    color: "var(--neutral-100)",
    fontFamily: "var(--font-sans)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
  },
  header: { textAlign: "center", marginBottom: "24px" },
  title: { fontSize: "24px", fontWeight: 800, color: "var(--neutral-50)", letterSpacing: "4px", margin: "0 0 4px" },
  subtitle: { fontSize: "10px", fontWeight: 600, color: "var(--neutral-500)", letterSpacing: "1px", margin: 0 },
  dotSeparator: { width: "4px", height: "4px", borderRadius: "50%", background: "var(--brand-500)", margin: "16px auto" },
  bizDetails: { fontSize: "11px", color: "var(--neutral-400)", lineHeight: "1.6" },
  invoiceNumber: { 
    marginTop: "20px",
    padding: "8px", 
    border: "1px solid var(--border-default)", 
    borderRadius: "8px", 
    fontSize: "12px", 
    fontWeight: 700, 
    color: "var(--brand-400)", 
    letterSpacing: "0.5px" 
  },
  section: { margin: "24px 0" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  gridItem: { display: "flex", flexDirection: "column" },
  label: { fontSize: "10px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" },
  value: { fontSize: "13px", fontWeight: 600, color: "var(--neutral-200)" },
  customerSection: { marginBottom: "24px" },
  customerName: { fontSize: "14px", fontWeight: 700, color: "var(--neutral-100)", textTransform: "uppercase" },
  customerDoc: { fontSize: "12px", color: "var(--neutral-500)", marginTop: "1px" },
  divider: { height: "1px", background: "var(--border-default)", margin: "24px 0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "10px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", paddingBottom: "12px", borderBottom: "1px solid var(--border-default)" },
  td: { padding: "12px 0", verticalAlign: "top" },
  itemName: { fontSize: "12px", fontWeight: 700, color: "var(--neutral-200)", textTransform: "uppercase" },
  itemPrice: { fontSize: "10px", color: "var(--neutral-500)", marginTop: "2px" },
  boldValue: { fontSize: "12px", fontWeight: 700, color: "var(--neutral-100)" },
  summary: { marginTop: "24px", background: "var(--bg-base)", padding: "16px", borderRadius: "12px" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--neutral-400)", marginBottom: "8px" },
  totalFinal: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-default)" },
  totalFinalLabel: { fontSize: "12px", fontWeight: 700, color: "var(--neutral-100)", textTransform: "uppercase" },
  totalFinalAmount: { fontSize: "18px", fontWeight: 800, color: "var(--brand-400)" },
  footer: { textAlign: "center", marginTop: "32px" },
  footerThanks: { fontSize: "12px", fontWeight: 700, color: "var(--neutral-100)", letterSpacing: "2px" },
  footerLegal: { fontSize: "10px", color: "var(--neutral-600)", lineHeight: "1.6" },
};

const printStyles = `
  @media print {
    html, body {
      background: white !important;
      color: black !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    body * {
       visibility: hidden !important;
    }

    .printable-receipt, .printable-receipt * {
       visibility: visible !important;
    }

    .printable-receipt {
       position: absolute !important;
       left: 0 !important;
       top: 0 !important;
       width: 100% !important;
       max-width: 80mm !important;
       background: white !important;
       color: black !important;
       box-shadow: none !important;
       border: none !important;
       padding: 0 !important;
       margin: 0 !important;
       border-radius: 0 !important;
    }

    /* Forzar textos a negro para impresión */
    .printable-receipt span, 
    .printable-receipt p, 
    .printable-receipt h1,
    .printable-receipt div,
    .printable-receipt td, 
    .printable-receipt th {
       color: black !important;
    }

    .printable-receipt .tabular {
       font-variant-numeric: tabular-nums !important;
    }

    /* Ajustes específicos para ticketera térmica */
    @page {
      size: 80mm auto;
      margin: 0;
    }
  }
`;