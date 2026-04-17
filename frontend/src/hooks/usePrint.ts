"use client";

import { useState, useCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * usePrint — imprime un componente React aislado en un iframe,
 * evitando que el diálogo de impresión capture el dashboard completo.
 */
export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const print = useCallback((element: React.ReactElement) => {
    if (isPrinting) return;
    setIsPrinting(true);

    try {
      // Renderizar el componente a HTML estático
      const markup = renderToStaticMarkup(element);

      // Crear iframe oculto
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "80mm";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        setIsPrinting(false);
        return;
      }

      // Escribir HTML completo con CSS de impresión incluido
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Factura de Venta - OptiPlant</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

              * { box-sizing: border-box; margin: 0; padding: 0; }

              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: white;
                color: black;
                font-size: 12px;
              }

              @page {
                size: 80mm auto;
                margin: 4mm;
              }

              .receipt {
                width: 72mm;
                padding: 0;
                color: #000;
                font-family: 'Inter', monospace;
              }

              /* --- Header --- */
              .receipt-header { text-align: center; margin-bottom: 12px; }
              .receipt-title { font-size: 20px; font-weight: 900; letter-spacing: 4px; color: #000; }
              .receipt-subtitle { font-size: 9px; font-weight: 600; color: #555; letter-spacing: 1px; margin-top: 2px; }
              .receipt-biz { font-size: 10px; color: #444; line-height: 1.5; margin-top: 8px; }
              .receipt-dot { width: 4px; height: 4px; border-radius: 50%; background: #c0392b; margin: 10px auto; }
              .receipt-invoice {
                margin-top: 10px;
                padding: 5px 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 700;
                color: #c0392b;
                letter-spacing: 0.5px;
              }

              /* --- Info Grid --- */
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
              .info-item { display: flex; flex-direction: column; }
              .info-label { font-size: 9px; font-weight: 700; color: #777; text-transform: uppercase; letter-spacing: 0.5px; }
              .info-value { font-size: 11px; font-weight: 600; color: #111; margin-top: 1px; }
              .info-full { grid-column: span 2; }

              /* --- Customer --- */
              .customer-section { margin: 10px 0; }
              .customer-name { font-size: 12px; font-weight: 700; color: #000; text-transform: uppercase; }
              .customer-doc { font-size: 10px; color: #666; margin-top: 2px; }

              /* --- Divider --- */
              .divider { height: 1px; background: #ddd; margin: 10px 0; }
              .divider-dashed { border-top: 1px dashed #bbb; margin: 10px 0; }

              /* --- Items Table --- */
              table { width: 100%; border-collapse: collapse; }
              thead tr { border-bottom: 1px solid #ddd; }
              th {
                font-size: 9px;
                font-weight: 700;
                color: #555;
                text-transform: uppercase;
                padding-bottom: 6px;
                letter-spacing: 0.3px;
              }
              th:first-child { text-align: left; }
              th:nth-child(2) { text-align: center; width: 30px; }
              th:last-child { text-align: right; width: 60px; }
              td { padding: 7px 0; vertical-align: top; }
              td:nth-child(2) { text-align: center; font-weight: 700; font-size: 11px; }
              td:last-child { text-align: right; font-weight: 700; font-size: 11px; }
              .item-name { font-size: 11px; font-weight: 700; color: #000; text-transform: uppercase; }
              .item-price { font-size: 9px; color: #777; margin-top: 1px; }

              /* --- Totals --- */
              .totals-box { margin-top: 10px; background: #f5f5f5; padding: 10px; border-radius: 4px; }
              .totals-row { display: flex; justify-content: space-between; font-size: 11px; color: #555; margin-bottom: 5px; }
              .totals-final {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #ccc;
              }
              .totals-final-label { font-size: 11px; font-weight: 700; color: #000; text-transform: uppercase; }
              .totals-final-amount { font-size: 16px; font-weight: 900; color: #c0392b; }

              /* --- Footer --- */
              .receipt-footer { text-align: center; margin-top: 16px; }
              .footer-thanks { font-size: 11px; font-weight: 700; color: #000; letter-spacing: 2px; }
              .footer-legal { font-size: 9px; color: #666; line-height: 1.5; margin-top: 6px; }

              /* --- Tabular Nums --- */
              .num { font-variant-numeric: tabular-nums; }
            </style>
          </head>
          <body>
            ${markup}
          </body>
        </html>
      `);
      doc.close();

      // Esperar a que el iframe cargue (incluyendo fuentes si están disponibles)
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          // Limpiar después de un tiempo prudencial
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            setIsPrinting(false);
          }, 1000);
        }
      };
    } catch (error) {
      console.error("Error durante la impresión:", error);
      setIsPrinting(false);
    }
  }, [isPrinting]);

  return { print, isPrinting };
}
