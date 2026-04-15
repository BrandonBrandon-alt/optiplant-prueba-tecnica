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
  const [loading, setLoading]         = useState(true);
  const session = typeof window !== "undefined" ? getSession() : null;

  useEffect(() => {
    async function fetchAll() {
      try {
        const [val, top, bra] = await Promise.all([
          apiClient.GET("/api/v1/analytics/valuations"),
          apiClient.GET("/api/v1/analytics/top-products", { params: { query: { limit: 5 } } }),
          apiClient.GET("/api/branches"),
        ]);
        setValuations(val.data ?? []);
        setTopProducts(top.data ?? []);
        const branchList = bra.data ?? [];
        setBranches(branchList);

        if (branchList.length > 0) {
          const alertResults = await Promise.all(
            branchList.map((b) =>
              apiClient.GET("/api/v1/alerts", { params: { query: { branchId: b.id! } } })
            )
          );
          setAlerts(alertResults.flatMap((r) => r.data ?? []));
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

  const totalValue   = valuations.reduce((s, v) => s + (v.totalValue ?? 0), 0);
  const activeAlerts = alerts.filter((a) => !a.resolved).length;
  const topProduct   = topProducts[0];

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1100px" }}>
      <PageHeader
        title="Dashboard"
        description={
          <>
            Bienvenido,{" "}
            <em style={{ color: "var(--brand-500)", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
              {session?.email ?? "usuario"}
            </em>
            . Aquí está el resumen del sistema.
          </>
        }
      />

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <KpiCard
          label="Valorización total"
          value={formatCOP(totalValue)}
          sub={`${branches.length} sucursales activas`}
          accent="var(--brand-500)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <KpiCard
          label="Alertas activas"
          value={String(activeAlerts)}
          sub={`${alerts.length - activeAlerts} resueltas`}
          accent={activeAlerts > 0 ? "var(--brand-500)" : "var(--color-success)"}
          delay="0.05s"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
        />
        <KpiCard
          label="Producto estrella"
          value={topProduct?.productName ?? "—"}
          sub={topProduct ? `${topProduct.totalSoldQuantity} uds vendidas` : "Sin datos"}
          accent="var(--neutral-300)"
          delay="0.1s"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
        <KpiCard
          label="Sucursales"
          value={String(branches.length)}
          sub="registradas en el sistema"
          accent="var(--neutral-400)"
          delay="0.15s"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        />
      </div>

      {/* Two-column panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Alertas */}
        <Card
          title="Alertas de Stock"
          delay="0.15s"
          headerRight={
            activeAlerts > 0 ? (
              <Badge variant="danger">{activeAlerts} activas</Badge>
            ) : undefined
          }
        >
          {alerts.length === 0 ? (
            <EmptyState
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              title="No hay alertas"
              description="El stock de todas las sucursales está en niveles normales."
            />
          ) : (
            alerts.slice(0, 6).map((a) => <AlertRow key={a.id} alert={a} />)
          )}
        </Card>

        {/* Top Productos + Valorización */}
        <Card title="Top Productos Vendidos" delay="0.2s">
          {topProducts.length === 0 ? (
            <EmptyState
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
              title="Sin ventas aún"
              description="Registra ventas para ver el ranking de productos."
            />
          ) : (
            topProducts.map((p, i) => (
              <div
                key={p.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom: i < topProducts.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <span
                  style={{
                    width: "24px", height: "24px", borderRadius: "8px",
                    background: i === 0 ? "rgba(217,99,79,0.15)" : "var(--bg-hover)",
                    color: i === 0 ? "var(--brand-500)" : "var(--neutral-500)",
                    fontSize: "12px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: "13.5px", color: "var(--neutral-100)" }}>
                  {p.productName}
                </span>
                <Badge variant={i === 0 ? "danger" : "neutral"}>
                  {p.totalSoldQuantity} uds
                </Badge>
              </div>
            ))
          )}

          {valuations.length > 0 && (
            <>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--neutral-300)", margin: "20px 0 10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Valor por Sucursal
              </h3>
              {valuations.map((v) => (
                <div
                  key={v.branchId}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}
                >
                  <span style={{ color: "var(--neutral-300)" }}>{v.branchName}</span>
                  <span style={{ color: "var(--neutral-400)", fontFamily: "monospace", fontSize: "12px" }}>
                    {formatCOP(v.totalValue ?? 0)}
                  </span>
                </div>
              ))}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
