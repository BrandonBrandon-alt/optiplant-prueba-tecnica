"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import { getSession } from "@/api/auth";
import { useRouter } from "next/navigation";

type GlobalSummary = components["schemas"]["GlobalSummary"];
type BranchPerformance = components["schemas"]["BranchPerformance"];

const formatCOP = (val: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<GlobalSummary | null>(null);
  const [performance, setPerformance] = useState<BranchPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session || session.rol !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    async function fetchData() {
      try {
        const [sumRes, perfRes] = await Promise.all([
          apiClient.GET("/api/v1/analytics/global-summary"),
          apiClient.GET("/api/v1/analytics/branch-performance"),
        ]);
        setSummary(sumRes.data ?? null);
        setPerformance(perfRes.data ?? []);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-400)" }}>
        Cargando análisis global...
      </div>
    );
  }

  const maxRevenue = Math.max(...performance.map((p) => p.revenue ?? 0), 1);

  return ( performance.length > 0 && 
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--neutral-50)", marginBottom: "8px" }}>
          Análisis Global de la Red
        </h1>
        <p style={{ color: "var(--neutral-400)", fontSize: "15px" }}>
          Rendimiento comparativo y métricas consolidadas de todas las sucursales.
        </p>
      </header>

      {/* Stats Overview */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "20px",
        marginBottom: "40px" 
      }}>
        <div className="stat-card">
          <p className="label">Ingresos Totales</p>
          <p className="value">{formatCOP(summary?.totalRevenue ?? 0)}</p>
          <div className="trend success">↑ 12% vs mes anterior</div>
        </div>
        <div className="stat-card">
          <p className="label">Valor Inventario</p>
          <p className="value">{formatCOP(summary?.totalInventoryValue ?? 0)}</p>
          <p className="subtext">{summary?.branchCount} sedes activas</p>
        </div>
        <div className="stat-card">
          <p className="label">Unidades Vendidas</p>
          <p className="value">{(summary?.totalUnitsSold ?? 0).toLocaleString()}</p>
          <p className="subtext">Media de {(summary?.averageTicket ?? 0).toLocaleString()} por venta</p>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "32px",
        alignItems: "start" 
      }}>
        {/* Branch Comparison Chart */}
        <div style={{ 
          background: "var(--bg-card)", 
          padding: "24px", 
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-default)"
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--neutral-100)", marginBottom: "24px" }}>
            Ingresos por Sede
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {performance.map((p) => (
              <div key={p.branchId}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "var(--neutral-200)", fontWeight: 500 }}>{p.branchName}</span>
                  <span style={{ color: "var(--neutral-400)" }}>{formatCOP(p.revenue ?? 0)}</span>
                </div>
                <div style={{ 
                  height: "10px", 
                  background: "var(--bg-base)", 
                  borderRadius: "5px", 
                  overflow: "hidden" 
                }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${((p.revenue ?? 0) / maxRevenue) * 100}%`,
                    background: "linear-gradient(90deg, var(--brand-600), var(--brand-400))",
                    borderRadius: "5px",
                    transition: "width 1s ease-out"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency Table */}
        <div style={{ 
          background: "var(--bg-card)", 
          padding: "24px", 
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-default)"
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--neutral-100)", marginBottom: "24px" }}>
            Métricas Operativas
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)", textAlign: "left" }}>
                <th style={{ padding: "12px 0", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Sede</th>
                <th style={{ padding: "12px 0", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Transacciones</th>
                <th style={{ padding: "12px 0", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Uds Vendidas</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((p) => (
                <tr key={p.branchId} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "var(--neutral-100)", fontWeight: 500 }}>{p.branchName}</td>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "var(--neutral-300)" }}>{p.salesCount}</td>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "var(--neutral-300)" }}>{p.unitsSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: var(--bg-card);
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-default);
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
        }
        .label {
          font-size: 13px;
          color: var(--neutral-500);
          margin-bottom: 8px;
        }
        .value {
          font-size: 24px;
          font-weight: 700;
          color: var(--neutral-50);
          margin-bottom: 8px;
        }
        .subtext {
          font-size: 12px;
          color: var(--neutral-500);
        }
        .trend {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }
        .trend.success {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
        }
      `}</style>
    </div>
  );
}
