"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { apiClient } from "@/api/client";
import { getSession } from "@/api/auth";
import type { components } from "@/api/schema";

import Spinner    from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import Card       from "@/components/ui/Card";
import Badge      from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Modal      from "@/components/ui/Modal";
import Button     from "@/components/ui/Button";
import Input      from "@/components/ui/Input";
import Select     from "@/components/ui/Select";
import { useToast } from "@/context/ToastContext";

// ── Types ──────────────────────────────────────────────────
type ProductResponse  = components["schemas"]["ProductResponse"];
type LocalInventory   = components["schemas"]["LocalInventory"];
type BranchResponse   = components["schemas"]["BranchResponse"];

interface InventoryMovementExtended {
  id: number;
  type: "INGRESO" | "RETIRO";
  reason: string;
  quantity: number;
  date: string;
  productId: number;
  branchId: number;
  userId: number;
  referenceId?: number;
  referenceType?: string;
  finalBalance: number;
}

// ── Components ─────────────────────────────────────────────

function StockStatus({ current, minimum, unit }: { current: number; minimum: number; unit?: string }) {
  const isCritical = current <= minimum && minimum > 0;
  const isEmpty = current === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ fontSize: "18px", fontWeight: 800, color: isEmpty ? "var(--color-danger)" : isCritical ? "var(--color-warning)" : "var(--neutral-50)" }}>
          {current}
        </span>
        <span style={{ fontSize: "10px", color: "var(--neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>
          {unit || "UND"}
        </span>
      </div>
      {isEmpty ? (
        <Badge variant="danger">Agotado</Badge>
      ) : isCritical ? (
        <Badge variant="warning">Suelo Crítico</Badge>
      ) : (
        <Badge variant="success">Óptimo</Badge>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function InventoryPage() {
  const { showToast } = useToast();
  const session = typeof window !== "undefined" ? getSession() : null;
  const isAdmin = session?.rol === "ADMIN";
  const myBranchId = session?.sucursalId || null;

  const [activeTab, setActiveTab] = useState<"matrix" | "kardex">("matrix");
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Map<number, LocalInventory>>(new Map());
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  
  // Kardex specific
  const [kardexMovements, setKardexMovements] = useState<InventoryMovementExtended[]>([]);
  const [kardexLoading, setKardexLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingInv, setLoadingInv] = useState(false);

  // Modals state
  const [adjustingProduct, setAdjustingProduct] = useState<ProductResponse | null>(null);
  const [configProduct, setConfigProduct] = useState<{ p: ProductResponse; inv: LocalInventory } | null>(null);
  
  const [adjustData, setAdjustData] = useState({
    type: "INGRESO" as "INGRESO" | "RETIRO",
    quantity: 0,
    reason: "" as any,
    unitCost: 0,
  });
  const [minStockValue, setMinStockValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = isAdmin || (selectedBranchId !== null && selectedBranchId === myBranchId);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [bra, pro] = await Promise.all([
          apiClient.GET("/api/branches"),
          apiClient.GET("/api/catalog/products"),
        ]);
        setBranches(bra.data ?? []);
        setProducts(pro.data ?? []);
        
        // Default to user branch if exists, otherwise first branch
        const defaultBranch = bra.data?.find(b => b.id === myBranchId) || bra.data?.[0];
        if (defaultBranch) {
          setSelectedBranchId(defaultBranch.id ?? null);
        }
      } catch (err) {
        showToast("Error al inicializar datos", "error");
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, [showToast, myBranchId]);

  const refreshInventory = useCallback(async (branchId: number) => {
    setLoadingInv(true);
    try {
      const res = await apiClient.GET("/api/v1/inventory/branches/{branchId}", {
        params: { path: { branchId } }
      });
      const map = new Map<number, LocalInventory>();
      (res.data ?? []).forEach((item: LocalInventory) => {
        if (item.productId) map.set(item.productId, item);
      });
      setInventoryMap(map);
    } catch (err) {
      showToast("Error al cargar inventario", "error");
    } finally {
      setLoadingInv(false);
    }
  }, [showToast]);

  const fetchKardex = useCallback(async () => {
    if (!selectedBranchId) return;
    setKardexLoading(true);
    try {
      // For now, use the global movements if specific kardex route is not handling "all"
      const res = await apiClient.GET("/api/v1/inventory/movements" as any, {});
      const allMovements = (res.data ?? []) as any[];
      
      let filtered = allMovements.filter(m => m.branchId === selectedBranchId);
      if (selectedProductId !== "all") {
        filtered = filtered.filter(m => m.productId === parseInt(selectedProductId));
      }
      
      // Sort by date desc
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setKardexMovements(filtered);
    } catch (err) {
      showToast("Error al cargar el Kardex", "error");
    } finally {
      setKardexLoading(false);
    }
  }, [selectedBranchId, selectedProductId, showToast]);

  useEffect(() => {
    if (selectedBranchId) {
      if (activeTab === "matrix") refreshInventory(selectedBranchId);
      else fetchKardex();
    }
  }, [selectedBranchId, activeTab, refreshInventory, fetchKardex]);

  const handleAdjustSubmit = async () => {
    if (!adjustingProduct || !selectedBranchId) return;
    if (adjustData.quantity <= 0) {
      showToast("La cantidad debe ser mayor a 0", "warning");
      return;
    }
    if (!adjustData.reason) {
      showToast("El motivo es obligatorio", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = adjustData.type === "INGRESO" 
        ? "/api/v1/inventory/branches/{branchId}/products/{productId}/add"
        : "/api/v1/inventory/branches/{branchId}/products/{productId}/withdraw";
      
      const { error } = await apiClient.POST(endpoint as any, {
        params: { path: { branchId: selectedBranchId, productId: adjustingProduct.id! } },
        body: {
          quantity: adjustData.quantity,
          reason: adjustData.reason,
          userId: session?.id || 1,
          unitCost: adjustData.type === "INGRESO" ? adjustData.unitCost : undefined,
        }
      });

      if (error) throw error;

      showToast(`Movimiento registrado con éxito`, "success");
      setAdjustingProduct(null);
      refreshInventory(selectedBranchId);
    } catch (err: any) {
      showToast(err.message || "Error al actualizar stock", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfigSubmit = async () => {
    if (!configProduct || !selectedBranchId) return;
    setSubmitting(true);
    try {
      const { error } = await apiClient.PUT("/api/v1/inventory/branches/{branchId}/products/{productId}/config", {
        params: { 
          path: { branchId: selectedBranchId, productId: configProduct.p.id! },
          query: { minimumStock: minStockValue }
        }
      });

      if (error) throw error;

      showToast("Stock mínimo actualizado", "success");
      setConfigProduct(null);
      refreshInventory(selectedBranchId);
    } catch (err) {
      showToast("Error al actualizar configuración", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (id: number) => products.find(p => p.id === id)?.nombre || `Producto #${id}`;
  const getProductUnit = (id: number) => (products.find(p => p.id === id) as any)?.unit || "UND";

  if (loadingInit) return <Spinner fullPage />;

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1400px" }}>
      <PageHeader
        title="Centro de Control de Inventario"
        description="Gestión inmutable de stock, auditoría de Kardex y niveles críticos por sucursal."
      />

      {/* Selector de Sede y Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "24px" }}>
        <div style={{ display: "flex", gap: "32px", alignItems: "flex-end" }}>
          <div style={{ width: "300px" }}>
            <Select
              label="Cambiar Sucursal de Consulta"
              value={selectedBranchId}
              onChange={(val) => setSelectedBranchId(val)}
              options={branches.map(b => ({ value: b.id!, label: b.nombre! }))}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
            />
          </div>

          <div style={{ display: "flex", background: "var(--bg-surface)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border-default)" }}>
            <button 
              onClick={() => setActiveTab("matrix")}
              style={{ 
                padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                background: activeTab === "matrix" ? "var(--brand-500)" : "transparent",
                color: activeTab === "matrix" ? "white" : "var(--neutral-400)",
                transition: "all 0.2s"
              }}
            >
              Matriz de Stock
            </button>
            <button 
              onClick={() => setActiveTab("kardex")}
              style={{ 
                padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                background: activeTab === "kardex" ? "var(--brand-500)" : "transparent",
                color: activeTab === "kardex" ? "white" : "var(--neutral-400)",
                transition: "all 0.2s"
              }}
            >
              Kardex Histórico
            </button>
          </div>
        </div>

        {!canEdit && (
          <div style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--color-danger)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--color-danger)", fontWeight: 600 }}>🔒 Modo Solo Lectura</span>
          </div>
        )}
      </div>

      {activeTab === "matrix" ? (
        <Card style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-default)" }}>
          {loadingInv ? (
             <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
                    <th style={thStyle}>Producto</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Nivel de Stock</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Stock Mínimo</th>
                    <th style={thStyle}>Última Operación</th>
                    {canEdit && <th style={{ ...thStyle, textAlign: "right" }}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const inv = inventoryMap.get(p.id!);
                    const current = inv?.currentQuantity ?? 0;
                    const minimum = inv?.minimumStock ?? 0;
                    const unit = (p as any).unit || "UND";

                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "11px", color: "var(--neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>{p.sku}</span>
                            <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--neutral-100)" }}>{p.nombre}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                           <StockStatus current={current} minimum={minimum} unit={unit} />
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                           <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--neutral-500)" }}>{minimum} {unit}</span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: "12px", color: "var(--neutral-400)" }}>
                            {inv?.lastUpdated ? new Date(inv.lastUpdated).toLocaleString() : "Sin actividad registrada"}
                          </span>
                        </td>
                        {canEdit && (
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <Button variant="primary" size="sm" onClick={() => {
                                setAdjustingProduct(p);
                                setAdjustData({ type: "INGRESO", quantity: 0, reason: "", unitCost: p.costoPromedio ?? 0 });
                              }}>
                                Movimiento
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setConfigProduct({ p, inv: inv || { productId: p.id, minimumStock: 0, currentQuantity: 0 } });
                                setMinStockValue(minimum);
                              }}>
                                Configurar
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ width: "300px" }}>
            <Select
              label="Filtrar por Producto"
              value={selectedProductId}
              onChange={(val) => setSelectedProductId(val)}
              options={[
                { value: "all", label: "Todos los productos" },
                ...products.map(p => ({ value: p.id!.toString(), label: p.nombre! }))
              ]}
            />
          </div>

          <Card style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-default)" }}>
            {kardexLoading ? <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
                    <th style={thStyle}>Fecha y Hora</th>
                    <th style={thStyle}>Producto</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Motivo</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Cantidad</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Saldo Resultante</th>
                  </tr>
                </thead>
                <tbody>
                  {kardexMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px" }}>
                        <EmptyState 
                          title="Sin movimientos" 
                          description="No se han registrado transacciones de inventario para estos filtros." 
                          icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                        />
                      </td>
                    </tr>
                  ) : kardexMovements.map(m => (
                    <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--neutral-400)" }}>{new Date(m.date).toLocaleString()}</td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>{getProductName(m.productId)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant={m.type === "INGRESO" ? "success" : "danger"}>{m.type}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px" }}>{m.reason}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: m.type === "INGRESO" ? "var(--color-success)" : "var(--color-danger)" }}>
                        {m.type === "INGRESO" ? "+" : "-"}{m.quantity}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "var(--neutral-100)" }}>
                        {m.finalBalance} <small style={{ color: "var(--neutral-500)" }}>{getProductUnit(m.productId)}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* MODAL: MOVIMIENTO (INGRESO/RETIRO) */}
      <Modal 
        open={!!adjustingProduct} 
        onClose={() => setAdjustingProduct(null)}
        title={`Registrar Movimiento - ${adjustingProduct?.nombre}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button 
              onClick={() => setAdjustData({...adjustData, type: "INGRESO"})}
              style={{
                padding: "16px", borderRadius: "12px", border: "2px solid", cursor: "pointer", fontWeight: 700,
                borderColor: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--border-default)",
                background: adjustData.type === "INGRESO" ? "rgba(16, 185, 129, 0.1)" : "transparent",
                color: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--neutral-500)"
              }}
            >
              ENTRADA (+)
            </button>
            <button 
              onClick={() => setAdjustData({...adjustData, type: "RETIRO"})}
              style={{
                padding: "16px", borderRadius: "12px", border: "2px solid", cursor: "pointer", fontWeight: 700,
                borderColor: adjustData.type === "RETIRO" ? "var(--color-danger)" : "var(--border-default)",
                background: adjustData.type === "RETIRO" ? "rgba(239, 68, 68, 0.1)" : "transparent",
                color: adjustData.type === "RETIRO" ? "var(--color-danger)" : "var(--neutral-500)"
              }}
            >
              SALIDA (-)
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input 
              label={`Cantidad a ${adjustData.type === "INGRESO" ? "Ingresar" : "Retirar"}`}
              type="number"
              value={adjustData.quantity}
              onChange={(e) => setAdjustData({...adjustData, quantity: Number(e.target.value)})}
              placeholder="0.00"
            />
            <Select
              label="Motivo Obligatorio"
              value={adjustData.reason}
              onChange={(val) => setAdjustData({...adjustData, reason: val})}
              options={adjustData.type === "INGRESO" ? [
                { value: "COMPRA", label: "Compra a Proveedor" },
                { value: "DEVOLUCION", label: "Devolución de Cliente" },
                { value: "AJUSTE_POSITIVO", label: "Ajuste de Auditoría (+)" },
                { value: "TRASLADO", label: "Traslado Recibido" }
              ] : [
                { value: "VENTA", label: "Venta a Cliente" },
                { value: "MERMA", label: "Merma / Daño" },
                { value: "AJUSTE_NEGATIVO", label: "Ajuste de Auditoría (-)" },
                { value: "TRASLADO", label: "Traslado Enviado" }
              ]}
            />
          </div>

          {adjustData.type === "INGRESO" && (
            <Input 
              label="Costo Unitario (Sugerido)"
              type="number"
              value={adjustData.unitCost}
              onChange={(e) => setAdjustData({...adjustData, unitCost: Number(e.target.value)})}
            />
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="ghost" fullWidth onClick={() => setAdjustingProduct(null)}>Cancelar</Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleAdjustSubmit} 
              loading={submitting}
              style={{ background: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--color-danger)" }}
            >
              Registrar {adjustData.type === "INGRESO" ? "Entrada" : "Salida"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: MIN STOCK */}
      <Modal
        open={!!configProduct}
        onClose={() => setConfigProduct(null)}
        title={`Configurar Alertas - ${configProduct?.p.nombre}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Input 
            label="Stock Mínimo para Alerta"
            type="number"
            value={minStockValue}
            onChange={(e) => setMinStockValue(Number(e.target.value))}
          />
          <Button variant="primary" fullWidth onClick={handleConfigSubmit} loading={submitting}>Guardar Cambios</Button>
        </div>
      </Modal>
    </div>
  );
}

const thStyle = { 
  padding: "16px", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" as const, 
  fontWeight: 600, letterSpacing: "1px" 
};
