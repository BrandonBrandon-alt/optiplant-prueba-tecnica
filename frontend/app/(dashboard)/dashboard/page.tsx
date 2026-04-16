"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { getSession } from "@/api/auth";
import type { components } from "@/api/schema";

import Spinner    from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard    from "@/components/ui/KpiCard";
import Card       from "@/components/ui/Card";
import Badge      from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

// ── Types ──────────────────────────────────────────────────
type BranchValuation = components["schemas"]["BranchValuation"];
type TopProduct      = components["schemas"]["TopSellingProduct"];
type StockAlert      = components["schemas"]["StockAlertResponse"];
type BranchResponse  = components["schemas"]["BranchResponse"];
type TransferResponse = components["schemas"]["TransferResponse"];

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

// ── AlertRow: usa Badge ────────────────────────────────────
function AlertRow({ alert }: { alert: StockAlert }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div
          style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: alert.resolved ? "var(--color-success)" : "var(--brand-500)",
            marginTop: "6px", flexShrink: 0,
          }}
        />
        <div>
          <p style={{ fontSize: "13.5px", color: "var(--neutral-100)", marginBottom: "2px" }}>
            {alert.message}
          </p>
          <p style={{ fontSize: "12px", color: "var(--neutral-500)" }}>
            Sucursal #{alert.branchId} · Producto #{alert.productId}
          </p>
        </div>
      </div>
      <Badge variant={alert.resolved ? "success" : "danger"}>
        {alert.resolved ? "Resuelta" : "Activa"}
      </Badge>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────
export default function DashboardPage() {
  const [valuations, setValuations]   = useState<BranchValuation[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [alerts, setAlerts]           = useState<StockAlert[]>([]);
  const [branches, setBranches]       = useState<BranchResponse[]>([]);
  const [transfers, setTransfers]     = useState<TransferResponse[]>([]);
  const [performance, setPerformance]     = useState<components["schemas"]["BranchPerformance"][]>([]);
  const [global, setGlobal]           = useState<components["schemas"]["GlobalSummary"] | null>(null);
  const [loading, setLoading]         = useState(true);
  const session = typeof window !== "undefined" ? getSession() : null;

  useEffect(() => {
    async function fetchAll() {
      try {
        const [val, top, bra, glo, perf, tra] = await Promise.all([
          apiClient.GET("/api/v1/analytics/valuations"),
          apiClient.GET("/api/v1/analytics/top-products", { params: { query: { limit: 5 } } }),
          apiClient.GET("/api/branches"),
          apiClient.GET("/api/v1/analytics/global-summary"),
          apiClient.GET("/api/v1/analytics/performance"),
          apiClient.GET("/api/v1/transfers"),
        ]);
        setValuations(val.data ?? []);
        setTopProducts(top.data ?? []);
        setGlobal(glo.data ?? null);
        setPerformance(perf.data ?? []);
        setTransfers((tra.data ?? []).filter(t => t.status !== "RECEIVED"));
        const branchList = bra.data ?? [];
        setBranches(branchList);

        if (branchList.length > 0) {
          const alertResults = await Promise.all(
            branchList.map((b) =>
              apiClient.GET("/api/v1/alerts", { params: { query: { branchId: b.id! } } })
            )
          );
          setAlerts(alertResults.flatMap((r) => r.data ?? []).filter(a => !a.resolved));
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <Spinner fullPage />;

  const activeAlerts = alerts.length;
  const topProduct   = topProducts[0];
  const branchMap = new Map(branches.map(b => [b.id, b.nombre]));

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>
      <PageHeader
        title="Panel de Control Administrativo"
        description={
          <>
            Bienvenido,{" "}
            <em style={{ color: "var(--brand-500)", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
              {session?.nombre ?? session?.email ?? "Administrador"}
            </em>
            . Visualiza el estado global de tu red de sucursales.
          </>
        }
      />

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <KpiCard
          label="Ventas Netas"
          value={formatCOP(global?.totalRevenue ?? 0)}
          sub={`Ticket Promedio: ${formatCOP(global?.averageTicket ?? 0)}`}
          accent="var(--color-success)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <KpiCard
          label="Valor Inventario"
          value={formatCOP(global?.totalInventoryValue ?? 0)}
          sub={`${branches.length} sedes operativas`}
          accent="var(--neutral-200)"
          delay="0.05s"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-9-4-9 4m18 8l-9 4-9-4m18-4l-9 4-9-4m9-11v11"/></svg>}
        />
        <KpiCard
          label="Traslados Activos"
          value={String(transfers.length)}
          sub="Movimientos en proceso"
          accent="var(--brand-300)"
          delay="0.1s"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>}
        />
        <KpiCard
          label="Sedes Críticas"
          value={String(activeAlerts)}
          sub="Alertas de stock pendientes"
          accent={activeAlerts > 0 ? "var(--brand-500)" : "var(--color-success)"}
          delay="0.15s"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Rendimiento por Sucursal */}
        <Card title="Rendimiento por Sucursal" delay="0.2s">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {performance.map((p, i) => (
              <div key={p.branchId} style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "16px", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--neutral-100)" }}>{p.branchName}</p>
                  <p style={{ fontSize: "11px", color: "var(--neutral-500)" }}>{p.salesCount} ventas realizadas</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--neutral-100)" }}>{formatCOP(p.revenue ?? 0)}</p>
                  <p style={{ fontSize: "11px", color: "var(--color-success)" }}>Ventas</p>
                </div>
                <div style={{ height: "40px", width: "40px", borderRadius: "10px", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: i === 0 ? "var(--color-warning)" : "var(--neutral-400)" }}>#{i+1}</span>
                </div>
              </div>
            ))}
            {performance.length === 0 && (
              <EmptyState 
                title="Sin datos" 
                description="No hay sucursales con ventas registradas." 
                icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>}
              />
            )}
          </div>
        </Card>

        {/* Valorización de Inventario y Alertas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card title="Traslados en Curso" delay="0.25s">
            {transfers.length === 0 ? (
              <EmptyState title="Sin movimientos" description="No hay traslados activos actualmente." 
                icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>}
              />
            ) : (
              transfers.map((t, i) => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < transfers.length -1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--neutral-100)" }}>
                      {branchMap.get(t.originBranchId!) || "Sede A"} → {branchMap.get(t.destinationBranchId!) || "Sede B"}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--neutral-500)" }}>{t.status === "REQUESTED" ? "Solicitado" : "Enviado"}</p>
                  </div>
                  <Badge variant={t.status === "DISPATCHED" ? "warning" : "neutral"}>
                    ID #{t.id}
                  </Badge>
                </div>
              ))
            )}
          </Card>

          <Card title="Alertas de Stock" delay="0.3s">
            {alerts.length === 0 ? (
              <EmptyState title="Todo normal" description="No hay alertas críticas en la red." 
                icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              />
            ) : (
              alerts.slice(0, 4).map(a => <AlertRow key={a.id} alert={a} />)
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
