"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/api/client";
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

// ── StockStatusBadge ───────────────────────────────────────
function StockBadge({ current, minimum }: { current: number; minimum: number }) {
  if (current === 0)       return <Badge variant="danger" dot>Sin stock</Badge>;
  if (current <= minimum)  return <Badge variant="warning" dot>Stock crítico</Badge>;
  return <Badge variant="success" dot>Normal</Badge>;
}

// ── InventoryRow ───────────────────────────────────────────
function InventoryRow({
  product,
  inventory,
  onAdjust,
  onConfig,
}: {
  product: ProductResponse;
  inventory: LocalInventory | undefined;
  onAdjust: (p: ProductResponse) => void;
  onConfig: (p: ProductResponse, inv: LocalInventory) => void;
}) {
  const current = inventory?.currentQuantity ?? 0;
  const minimum = inventory?.minimumStock ?? 0;

  return (
    <tr
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--neutral-500)", background: "var(--bg-hover)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
          {product.sku}
        </span>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", color: "var(--neutral-100)", fontWeight: 500 }}>
            {product.nombre}
          </span>
        </div>
      </td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            fontFamily: "var(--font-serif)",
            color: current === 0
              ? "var(--brand-500)"
              : current <= minimum
              ? "var(--color-warning)"
              : "var(--neutral-50)",
          }}
        >
          {inventory ? current : "0"}
        </span>
      </td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <span style={{ fontSize: "13px", color: "var(--neutral-500)", fontFamily: "monospace" }}>
          {inventory ? minimum : "0"}
        </span>
      </td>
      <td style={{ padding: "12px 16px" }}>
        {inventory ? (
          <StockBadge current={current} minimum={minimum} />
        ) : (
          <Badge variant="neutral">Sin registrar</Badge>
        )}
      </td>
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: "11px", color: "var(--neutral-500)" }}>
          {inventory?.lastUpdated
            ? new Date(inventory.lastUpdated).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
            : "—"}
        </span>
      </td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onAdjust(product)}
            title="Ajustar stock (Entrada/Salida)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => inventory && onConfig(product, inventory)}
            disabled={!inventory}
            title="Configurar stock mínimo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function InventoryPage() {
  const { showToast } = useToast();
  const [branches, setBranches]             = useState<BranchResponse[]>([]);
  const [products, setProducts]             = useState<ProductResponse[]>([]);
  const [inventoryMap, setInventoryMap]     = useState<Map<number, LocalInventory>>(new Map());
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  
  const [loadingInit, setLoadingInit]       = useState(true);
  const [loadingInv, setLoadingInv]         = useState(false);

  // Modals state
  const [adjustingProduct, setAdjustingProduct] = useState<ProductResponse | null>(null);
  const [configProduct, setConfigProduct]       = useState<{ p: ProductResponse; inv: LocalInventory } | null>(null);
  
  // Form states
  const [adjustData, setAdjustData] = useState({
    type: "INGRESO" as "INGRESO" | "RETIRO",
    quantity: 0,
    reason: "AJUSTE" as any,
    unitCost: 0,
  });
  const [minStockValue, setMinStockValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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
        if (bra.data && bra.data.length > 0) {
          setSelectedBranchId(bra.data[0].id ?? null);
        }
      } catch (err) {
        showToast("Error al inicializar datos", "error");
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, [showToast]);

  // Load inventory when branch changes (Bulk)
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

  useEffect(() => {
    if (selectedBranchId) refreshInventory(selectedBranchId);
  }, [selectedBranchId, refreshInventory]);

  // Actions
  const handleAdjustSubmit = async () => {
    if (!adjustingProduct || !selectedBranchId) return;
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
          userId: 1, // TODO: Get from auth context
          unitCost: adjustData.type === "INGRESO" ? adjustData.unitCost : undefined,
        }
      });

      if (error) throw error;

      showToast(`Stock actualizado correctamente`, "success");
      setAdjustingProduct(null);
      refreshInventory(selectedBranchId);
    } catch (err) {
      showToast("Error al actualizar stock", "error");
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

  if (loadingInit) return <Spinner fullPage />;

  const withStock  = products.filter((p) => (inventoryMap.get(p.id!)?.currentQuantity ?? 0) > 0).length;
  const critical   = products.filter((p) => {
    const inv = inventoryMap.get(p.id!);
    return inv && inv.currentQuantity! <= inv.minimumStock! && inv.minimumStock! > 0;
  }).length;

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>
      <PageHeader
        title="Gestión de Stock Local"
        description="Administra los ingresos, retiros y niveles críticos de inventario por sucursal."
      />

      {/* Filter & Stats bar */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", gap: "20px", flexWrap: "wrap", animation: "fadeIn 0.4s ease both" }}>
        <div style={{ width: "280px" }}>
          <Select
            label="Sucursal Activa"
            value={selectedBranchId}
            onChange={(val) => setSelectedBranchId(val)}
            options={branches.map(b => ({ value: b.id!, label: b.nombre! }))}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "var(--bg-card)", padding: "10px 20px", borderRadius: "12px", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--neutral-100)" }}>{products.length}</span>
            <span style={{ fontSize: "10px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Productos</span>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.1)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-success)" }}>{withStock}</span>
            <span style={{ fontSize: "10px", color: "var(--color-success)", textTransform: "uppercase", opacity: 0.8 }}>Con Stock</span>
          </div>
          <div style={{ background: "rgba(245, 158, 11, 0.05)", padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(245, 158, 11, 0.1)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-warning)" }}>{critical}</span>
            <span style={{ fontSize: "10px", color: "var(--color-warning)", textTransform: "uppercase", opacity: 0.8 }}>Agotándose</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
        {loadingInv ? (
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <EmptyState 
            title="Catálogo vacío" 
            description="No hay productos registrados para gestionar." 
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 8l-9-4-9 4m18 8l-9 4-9-4m18-4l-9 4-9-4m9-11v11"/></svg>}
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}>
                  {["SKU", "Producto", "Stock", "Mín Cant", "Estado", "Actualizado", ""].map((h, i) => (
                    <th key={h} style={{ 
                      padding: "14px 16px", fontSize: "11px", fontWeight: 600, color: "var(--neutral-500)", 
                      textAlign: i === 2 || i === 3 ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.05em" 
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <InventoryRow 
                    key={p.id} 
                    product={p} 
                    inventory={inventoryMap.get(p.id!)} 
                    onAdjust={(product) => {
                      setAdjustingProduct(product);
                      setAdjustData({ type: "INGRESO", quantity: 0, reason: "AJUSTE", unitCost: product.costoPromedio ?? 0 });
                    }}
                    onConfig={(product, inv) => {
                      setConfigProduct({ p: product, inv });
                      setMinStockValue(inv.minimumStock ?? 0);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL: STOCK ADJUSTMENT */}
      <Modal 
        open={!!adjustingProduct} 
        onClose={() => setAdjustingProduct(null)}
        title={`Movimiento de Stock: ${adjustingProduct?.nombre}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div 
              onClick={() => setAdjustData({...adjustData, type: "INGRESO"})}
              style={{
                padding: "12px", border: "1.5px solid", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                borderColor: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--border-default)",
                background: adjustData.type === "INGRESO" ? "rgba(16, 185, 129, 0.05)" : "transparent",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600, color: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--neutral-400)" }}>INGRESO (+)</span>
            </div>
            <div 
              onClick={() => setAdjustData({...adjustData, type: "RETIRO"})}
              style={{
                padding: "12px", border: "1.5px solid", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                borderColor: adjustData.type === "RETIRO" ? "var(--color-danger)" : "var(--border-default)",
                background: adjustData.type === "RETIRO" ? "rgba(239, 68, 68, 0.05)" : "transparent",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600, color: adjustData.type === "RETIRO" ? "var(--color-danger)" : "var(--neutral-400)" }}>RETIRO (-)</span>
            </div>
          </div>

          <Input 
            label="Cantidad" 
            type="number" 
            value={adjustData.quantity} 
            onChange={(e) => setAdjustData({...adjustData, quantity: Number(e.target.value)})}
            placeholder="0.00"
          />

          {adjustData.type === "INGRESO" && (
            <Input 
              label="Costo Unitario (Captura para promedio ponderado)" 
              type="number" 
              value={adjustData.unitCost} 
              onChange={(e) => setAdjustData({...adjustData, unitCost: Number(e.target.value)})}
              placeholder="0.00"
            />
          )}

          <Select
            label="Motivo del movimiento"
            value={adjustData.reason}
            onChange={(val) => setAdjustData({...adjustData, reason: val})}
            options={[
              { value: "AJUSTE", label: "Ajuste Manual" },
              { value: "MERMA",  label: "Merma / Desperdicio" },
              { value: "COMPRA", label: "Compra (Entrada)" },
              { value: "VENTA",  label: "Venta (Salida)" },
              { value: "TRASLADO", label: "Traslado entre sedes" },
            ]}
          />

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <Button variant="ghost" fullWidth onClick={() => setAdjustingProduct(null)}>Cancelar</Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleAdjustSubmit} 
              loading={submitting}
              style={{ background: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--color-danger)" }}
            >
              Confirmar {adjustData.type === "INGRESO" ? "Ingreso" : "Retiro"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: MIN STOCK CONFIG */}
      <Modal
        open={!!configProduct}
        onClose={() => setConfigProduct(null)}
        title={`Configurar Niveles: ${configProduct?.p.nombre}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <p style={{ fontSize: "13px", color: "var(--neutral-400)" }}>
            Define el umbral mínimo para generar alertas automáticas cuando el stock de este producto baje en esta sucursal.
          </p>
          
          <Input 
            label="Stock Mínimo (Alerta)" 
            type="number" 
            value={minStockValue}
            onChange={(e) => setMinStockValue(Number(e.target.value))}
            placeholder="Ejem: 5.00"
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <Button variant="ghost" fullWidth onClick={() => setConfigProduct(null)}>Volver</Button>
            <Button variant="primary" fullWidth onClick={handleConfigSubmit} loading={submitting}>Guardar Cambios</Button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
