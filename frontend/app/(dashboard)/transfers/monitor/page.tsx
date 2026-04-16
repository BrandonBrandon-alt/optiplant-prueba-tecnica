"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import { getSession } from "@/api/auth";
import { useRouter } from "next/navigation";

type TransferResponse = components["schemas"]["TransferResponse"];
type BranchResponse = components["schemas"]["BranchResponse"];

export default function TransferMonitorPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<TransferResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session || session.rol !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    async function fetchData() {
      try {
        const [transRes, branchRes] = await Promise.all([
          apiClient.GET("/api/v1/transfers"),
          apiClient.GET("/api/branches"),
        ]);
        setTransfers(transRes.data ?? []);
        setBranches(branchRes.data ?? []);
      } catch (error) {
        console.error("Error fetching transfers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const getBranchName = (id: number) => branches.find(b => b.id === id)?.nombre ?? `Sede ${id}`;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDIENTE": return { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" };
      case "EN_TRANSITO": return { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
      case "ENTREGADO": return { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e" };
      default: return { bg: "var(--bg-base)", color: "var(--neutral-400)" };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-400)" }}>
        Cargando monitor logístico...
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--neutral-50)", marginBottom: "8px" }}>
            Monitor Logístico Global
          </h1>
          <p style={{ color: "var(--neutral-400)", fontSize: "15px" }}>
            Seguimiento en tiempo real de todos los traslados entre sucursales.
          </p>
        </div>
        <div style={{ padding: "8px 16px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-default)" }}>
          <span style={{ fontSize: "13px", color: "var(--neutral-500)", marginRight: "8px" }}>Activos:</span>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--brand-500)" }}>
            {transfers.filter(t => t.status !== "ENTREGADO").length}
          </span>
        </div>
      </header>

      <div style={{ 
        background: "var(--bg-card)", 
        borderRadius: "var(--radius-lg)", 
        border: "1px solid var(--border-default)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-default)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>ID / Fecha</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Ruta (Origen → Destino)</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Estado</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Items</th>
              <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Llegada Est.</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "var(--neutral-500)" }}>
                  No hay traslados registrados en el sistema.
                </td>
              </tr>
            ) : (
              transfers.map((t) => {
                const style = getStatusStyle(t.status || "");
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border-default)", transition: "background 0.2s ease" }} className="row-hover">
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: "14px", color: "var(--neutral-100)", fontWeight: 600 }}>#{t.id}</div>
                      <div style={{ fontSize: "12px", color: "var(--neutral-500)" }}>{new Date(t.requestDate || "").toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "14px", color: "var(--neutral-200)" }}>{getBranchName(t.originBranchId || 0)}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-500)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <span style={{ fontSize: "14px", color: "var(--neutral-200)", fontWeight: 500 }}>{getBranchName(t.destinationBranchId || 0)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ 
                        padding: "4px 10px", 
                        borderRadius: "20px", 
                        fontSize: "11px", 
                        fontWeight: 700,
                        background: style.bg,
                        color: style.color,
                        letterSpacing: "0.02em"
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ fontSize: "14px", color: "var(--neutral-300)" }}>
                        {t.details?.length} productos
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontSize: "14px", color: "var(--neutral-400)" }}>
                      {t.estimatedArrivalDate ? new Date(t.estimatedArrivalDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .row-hover:hover {
          background: rgba(255,255,255,0.01);
        }
      `}</style>
    </div>
  );
}
