"use client";

import React from "react";

export interface SaleReceiptData {
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
}

interface SaleReceiptProps {
  sale: SaleReceiptData;
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
      hour12: true,
    });

  return (
    <div className="receipt">
      {/* Header */}
      <div className="receipt-header">
        <h1 className="receipt-title">OPTIPLANT</h1>
        <p className="receipt-subtitle">SISTEMAS AGROINDUSTRIALES</p>
        <div className="receipt-dot" />
        <div className="receipt-biz">
          NIT: 900.123.456-1<br />
          {sale.branchName || "Sede Principal"}<br />
          Tel: (604) 444-0000
        </div>
        <div className="receipt-invoice">
          FACTURA DE VENTA N° {String(sale.id).padStart(6, "0")}
        </div>
      </div>

      {/* Info Grid */}
      <div className="divider-dashed" />
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Fecha</span>
          <span className="info-value">{formatDate(sale.date)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Hora</span>
          <span className="info-value">{formatTime(sale.date)}</span>
        </div>
        <div className="info-item info-full">
          <span className="info-label">Atendido por</span>
          <span className="info-value">{sale.userName || "Operador"}</span>
        </div>
      </div>
      <div className="divider-dashed" />

      {/* Customer */}
      <div className="customer-section">
        <span className="info-label">Cliente / NIT</span>
        <div className="customer-name">{sale.customerName || "Venta General (Público)"}</div>
        <div className="customer-doc">{sale.customerDocument || "No Identificado"}</div>
      </div>

      <div className="divider" />

      {/* Items */}
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Descripción</th>
            <th style={{ textAlign: "center", width: "30px" }}>Cant</th>
            <th style={{ textAlign: "right", width: "60px" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.details?.map((detail, idx) => (
            <tr key={detail.id ?? idx}>
              <td>
                <div className="item-name">{detail.productName || `Producto #${detail.productId}`}</div>
                <div className="item-price">{formatCurrency(detail.unitPriceApplied)} c/u</div>
              </td>
              <td>
                <span className="num">{detail.quantity}</span>
              </td>
              <td>
                <span className="num">{formatCurrency(detail.subtotalLine)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="totals-box">
        <div className="totals-row">
          <span>Subtotal</span>
          <span className="num">{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.totalDiscount > 0 && (
          <div className="totals-row" style={{ color: "#c0392b" }}>
            <span>Descuento</span>
            <span className="num">-{formatCurrency(sale.totalDiscount)}</span>
          </div>
        )}
        <div className="totals-final">
          <span className="totals-final-label">Valor Total</span>
          <span className="num totals-final-amount">{formatCurrency(sale.totalFinal)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="divider-dashed" />
      <div className="receipt-footer">
        <p className="footer-thanks">GRACIAS POR SU COMPRA</p>
        <div className="receipt-dot" />
        <p className="footer-legal">
          Documento equivalente a factura de venta.<br />
          Favor verificar su mercancía.<br />
          Software: OptiPlant ERP v2.0
        </p>
      </div>
    </div>
  );
}