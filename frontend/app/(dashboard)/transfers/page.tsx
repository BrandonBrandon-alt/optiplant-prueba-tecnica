"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/api/client";
import { getSession } from "@/api/auth";
import type { components } from "@/api/schema";
import Spinner from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";

// Components
import NewTransferModal from "@/components/transfers/NewTransferModal";
import ReceiveTransferModal from "@/components/transfers/ReceiveTransferModal";
import DispatchTransferModal from "@/components/transfers/DispatchTransferModal";

type TransferResponse = components["schemas"]["TransferResponse"];
type BranchResponse = components["schemas"]["BranchResponse"];

export default function TransfersManagementPage() {
  const { showToast } = useToast();
  const [transfers, setTransfers] = useState<TransferResponse[]>([]);
  const [branches, setBranches] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [receivingTransfer, setReceivingTransfer] = useState<TransferResponse | null>(null);
  const [dispatchingTransfer, setDispatchingTransfer] = useState<TransferResponse | null>(null);

  const session = typeof window !== "undefined" ? getSession() : null;
  const isAdmin = session?.rol === "ADMIN";
  const myBranchId = session?.sucursalId || null;

  const fetchTransfers = useCallback(async () => {
    try {
      const [tRes, bRes] = await Promise.all([
        apiClient.GET("/api/v1/transfers"),
        apiClient.GET("/api/branches"),
      ]);
      
      const allTransfers = tRes.data ?? [];
      // Filter for non-admins: only show where I am origin or destination
      if (!isAdmin && myBranchId) {
        setTransfers(allTransfers.filter(t => t.originBranchId === myBranchId || t.destinationBranchId === myBranchId));
      } else {
        setTransfers(allTransfers);
      }
      
      setBranches(new Map((bRes.data ?? []).map(b => [b.id!, b.nombre!])));
    } catch (err) {
      showToast("Error al cargar traslados", "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, myBranchId, showToast]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);


  if (loading) return <Spinner fullPage />;

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>
      <PageHeader
        title="Gestión de Traslados"
        description="Solicita y gestiona el movimiento de mercancía entre las sucursales de la red."
        actions={
          <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>
            + Nueva Solicitud
          </Button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {transfers.length === 0 ? (
          <EmptyState
            title="Sin traslados"
            description="Aún no hay solicitudes de movimiento de mercancía."
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>}
          />
        ) : (
          transfers.map((t) => (
            <Card key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: "4px" }}>Ruta</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                    <span>{branches.get(t.originBranchId!) || t.originBranchId}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <span>{branches.get(t.destinationBranchId!) || t.destinationBranchId}</span>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: "11px", color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: "4px" }}>Estado</p>
                  <Badge variant={t.status === "RECEIVED" ? "success" : t.status === "DISPATCHED" ? "warning" : "neutral"}>
                    {t.status === "REQUESTED" ? "Solicitado" : t.status === "DISPATCHED" ? "En Tránsito" : "Recibido"}
                  </Badge>
                </div>

                <div>
                  <p style={{ fontSize: "11px", color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: "4px" }}>Items</p>
                  <p style={{ fontSize: "14px" }}>{t.details?.length} productos</p>
                </div>

                <div>
                  <p style={{ fontSize: "11px", color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: "4px" }}>Creado</p>
                  <p style={{ fontSize: "14px" }}>{new Date(t.requestDate!).toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {/* ACTIONS */}
                {t.status === "REQUESTED" && (isAdmin || t.originBranchId === myBranchId) && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => setDispatchingTransfer(t)}
                  >
                    Despachar
                  </Button>
                )}

                {t.status === "DISPATCHED" && (isAdmin || t.destinationBranchId === myBranchId) && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => setReceivingTransfer(t)}
                  >
                    Recibir
                  </Button>
                )}

                {t.status === "RECEIVED" && (
                  <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: 600 }}>Completado</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <NewTransferModal 
        open={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSuccess={fetchTransfers}
        currentBranchId={myBranchId}
        isAdmin={isAdmin}
      />

      <ReceiveTransferModal
        open={!!receivingTransfer}
        onClose={() => setReceivingTransfer(null)}
        onSuccess={fetchTransfers}
        transfer={receivingTransfer}
        userId={session?.id || null}
      />

      <DispatchTransferModal
        open={!!dispatchingTransfer}
        onClose={() => setDispatchingTransfer(null)}
        onSuccess={fetchTransfers}
        transfer={dispatchingTransfer}
        userId={session?.id || null}
      />
    </div>
  );
}
