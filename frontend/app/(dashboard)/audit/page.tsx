"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import Spinner from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";

type InventoryMovement = components["schemas"]["InventoryMovement"];
type UserResponse = components["schemas"]["UserResponse"];
type ProductResponse = components["schemas"]["ProductResponse"];
type BranchResponse = components["schemas"]["BranchResponse"];

export default function AuditPage() {
  const { showToast } = useToast();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [branches, setBranches] = useState<Map<number, string>>(new Map());
  const [products, setProducts] = useState<Map<number, string>>(new Map());
  const [users, setUsers] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [movs, bras, pros, usrs] = await Promise.all([
          (apiClient as any).GET("/api/v1/inventory/movements"),
          apiClient.GET("/api/branches"),
          apiClient.GET("/api/catalog/products"),
          apiClient.GET("/api/users"),
        ]);

        setMovements(movs.data ?? []);
        setBranches(new Map((bras.data ?? []).map((b) => [b.id!, b.nombre!])));
        setProducts(new Map((pros.data ?? []).map((p) => [p.id!, p.nombre!])));
        setUsers(new Map((usrs.data as UserResponse[] ?? []).map((u) => [u.id!, u.nombre!])));
      } catch (err) {
        showToast("Error al cargar datos de auditoría", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  if (loading) return <Spinner fullPage />;

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>
      <PageHeader
        title="Auditoría Global de Inventario"
        description="Seguimiento detallado de todos los movimientos de stock realizados en la red OptiPlant."
      />

      <Card style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
        {movements.length === 0 ? (
          <EmptyState
            title="Sin movimientos"
            description="No se han registrado movimientos de inventario en el sistema."
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>}
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
                  <th style={headerStyle}>Fecha</th>
                  <th style={headerStyle}>Tipo</th>
                  <th style={headerStyle}>Motivo</th>
                  <th style={headerStyle}>Producto</th>
                  <th style={headerStyle}>Sucursal</th>
                  <th style={headerStyle}>Cantidad</th>
                  <th style={headerStyle}>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={cellStyle}>
                      {m.date ? new Date(m.date).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td style={cellStyle}>
                      <Badge variant={m.type === "INGRESO" ? "success" : "danger"}>
                        {m.type}
                      </Badge>
                    </td>
                    <td style={cellStyle}>{m.reason || "—"}</td>
                    <td style={cellStyle}>{products.get(m.productId!) || m.productId}</td>
                    <td style={cellStyle}>{branches.get(m.branchId!) || m.branchId}</td>
                    <td style={{ ...cellStyle, fontWeight: 700, textAlign: "right", fontFamily: "var(--font-serif)" }}>
                      {m.quantity}
                    </td>
                    <td style={cellStyle}>{users.get(m.userId!) || m.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

const headerStyle = {
  padding: "14px 16px",
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--neutral-500)",
  textAlign: "left" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const cellStyle = {
  padding: "12px 16px",
  fontSize: "13px",
  color: "var(--neutral-100)",
};
