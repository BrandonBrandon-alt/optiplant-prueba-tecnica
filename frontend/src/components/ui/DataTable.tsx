"use client";

import React from "react";
import Spinner from "./Spinner";
import EmptyState from "./EmptyState";

/**
 * Representa una columna en la tabla.
 */
export interface Column<T> {
  /** Texto del encabezado. */
  header: string | React.ReactNode;
  /** Llave única para la columna. */
  key: string;
  /** Función opcional para personalizar cómo se renderiza la celda. */
  render?: (item: T) => React.ReactNode;
  /** Alineación del contenido. */
  align?: "left" | "center" | "right";
  /** Ancho manual (ej: "120px"). */
  width?: string;
  /** Indica si la columna es ordenable. */
  sortable?: boolean;
}

interface DataTableProps<T> {
  /** Array de columnas a mostrar. */
  columns: Column<T>[];
  /** Array de datos (objetos) a listar. */
  data: T[];
  /** Indica si la tabla está en estado de carga. */
  isLoading?: boolean;
  /** Acción al hacer clic en una fila. */
  onRowClick?: (item: T) => void;
  /** Configuración actual del ordenamiento. */
  sortConfig?: { key: string; direction: "asc" | "desc" | null };
  /** Callback cuando cambia el ordenamiento. */
  onSort?: (key: string) => void;
  /** Configuración para el estado vacío. */
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
  /** Función opcional para renderizar tarjetas en móviles (reemplaza la tabla). */
  renderMobileCard?: (item: T) => React.ReactNode;
  /** Ancho mínimo para forzar scroll horizontal en escritorio si hay muchas columnas. */
  minWidth?: string;
  /** Densidad del espaciado. */
  density?: "normal" | "compact";
}

/**
 * DataTable Component
 * Provee una estructura de tabla ERP de alta densidad, responsiva y consistente.
 */
export default function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  sortConfig,
  onSort,
  emptyState,
  renderMobileCard,
  minWidth = "100%",
  density = "normal",
}: DataTableProps<T>) {
  
  // ── Estados Especiales ───────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div style={{ padding: "40px" }}>
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </div>
    );
  }

  // ── Helpers de Estilo ────────────────────────────────────────

  const padding = density === "compact" ? "8px 12px" : "16px";

  const thStyle = (column: Column<T>): React.CSSProperties => ({
    padding,
    fontSize: "11px",
    color: "var(--neutral-500)",
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: "1px",
    textAlign: column.align || "left",
    width: column.width,
    cursor: column.sortable ? "pointer" : "default",
    position: "relative",
    userSelect: "none",
  });

  const tdStyle = (column: Column<T>): React.CSSProperties => ({
    padding,
    textAlign: column.align || "left",
  });

  // ── Render Normal ────────────────────────────────────────────

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {/* Table Layer (Desktop or Tablet) */}
      <div className={renderMobileCard ? "hidden md:block" : "block"}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth }}>
          <thead>
            <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key;
                const direction = isSorted ? sortConfig?.direction : null;

                return (
                  <th 
                    key={col.key} 
                    style={thStyle(col)}
                    onClick={() => col.sortable && onSort?.(col.key)}
                    onMouseEnter={(e) => col.sortable && (e.currentTarget.style.color = "var(--neutral-200)")}
                    onMouseLeave={(e) => col.sortable && (e.currentTarget.style.color = "var(--neutral-500)")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: col.align === "right" ? "flex-end" : "flex-start" }}>
                      {col.header}
                      {col.sortable && (
                        <div style={{ display: "flex", flexDirection: "column", lineHeight: "1", fontSize: "8px", color: isSorted ? "var(--brand-500)" : "var(--neutral-700)" }}>
                          <svg 
                            width="8" height="6" viewBox="0 0 10 6" fill="currentColor" 
                            style={{ opacity: direction === "asc" ? 1 : 0.3, marginBottom: "1px" }}
                          >
                            <path d="M5 0L10 6H0L5 0Z" />
                          </svg>
                          <svg 
                            width="8" height="6" viewBox="0 0 10 6" fill="currentColor" 
                            style={{ opacity: direction === "desc" ? 1 : 0.3 }}
                          >
                            <path d="M5 6L0 0H10L5 6Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background 0.1s",
                  cursor: onRowClick ? "pointer" : "default",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle(col)}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Layer (Mobile) */}
      {renderMobileCard && (
        <div className="md:hidden flex flex-col">
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {renderMobileCard(item)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
