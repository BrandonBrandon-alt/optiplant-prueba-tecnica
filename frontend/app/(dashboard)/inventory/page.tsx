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
import Toolbar    from "@/components/ui/Toolbar";
import Button     from "@/components/ui/Button";
import Input      from "@/components/ui/Input";
import Select     from "@/components/ui/Select";
import DataTable  from "@/components/ui/DataTable";
import Separator  from "@/components/ui/Separator";
import { useToast } from "@/context/ToastContext";
import { Search, Info, Lock } from "lucide-react";
import StockStatus from "@/components/ui/StockStatus";
import { usePersistence } from "@/hooks/usePersistence";
import SearchFilter from "@/components/ui/SearchFilter";

// ── Types ──────────────────────────────────────────────────
type ProductResponse  = components["schemas"]["ProductResponse"];
type LocalInventory   = components["schemas"]["LocalInventory"];
type BranchResponse   = components["schemas"]["BranchResponse"];
type InventoryProductResponse = components["schemas"]["InventoryProductResponse"];

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

// ── Main Page ──────────────────────────────────────────────
export default function InventoryPage() {
  const { showToast } = useToast();
  const session = typeof window !== "undefined" ? getSession() : null;
  const isAdmin = session?.rol === "ADMIN";
  const isManager = session?.rol === "MANAGER";
  const isSeller = session?.rol === "SELLER";
  const myBranchId = session?.sucursalId || null;

  const [invPageState, setInvPageState, isLoaded] = usePersistence("zen_inventory_inventory_state", {
    branchId: null as number | null,
    tab: "matrix" as "matrix" | "kardex",
    search: ""
  });

  const selectedBranchId = invPageState.branchId;
  const activeTab = invPageState.tab;
  const searchTerm = invPageState.search;

  const setSelectedBranchId = (val: number | null) => setInvPageState(prev => ({ ...prev, branchId: val }));
  const setActiveTab = (val: "matrix" | "kardex") => setInvPageState(prev => ({ ...prev, tab: val }));
  const setSearchTerm = (val: string) => setInvPageState(prev => ({ ...prev, search: val }));

  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Map<number, InventoryProductResponse>>(new Map());
  
  // Kardex specific
  const [kardexMovements, setKardexMovements] = useState<InventoryMovementExtended[]>([]);
  const [kardexLoading, setKardexLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingInv, setLoadingInv] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" | null }>({ key: "stockActual", direction: "desc" });

  // Modals state
  const [adjustingProduct, setAdjustingProduct] = useState<ProductResponse | null>(null);
  const [configProduct, setConfigProduct] = useState<{ p: ProductResponse; inv: any } | null>(null);
  
  const [adjustData, setAdjustData] = useState({
    type: "INGRESO" as "INGRESO" | "RETIRO",
    quantity: 0,
    reason: "" as any,
    unitCost: 0,
  });
  const [minStockValue, setMinStockValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = isAdmin || (isManager && selectedBranchId === myBranchId);

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
        
        const defaultBranch = bra.data?.find(b => b.id === myBranchId) || bra.data?.[0];
        if (defaultBranch && !selectedBranchId) {
          setSelectedBranchId(defaultBranch.id ?? null);
        }
      } catch (err) {
        showToast("Error al inicializar datos", "error");
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, [showToast, myBranchId, selectedBranchId]);

  const refreshInventory = useCallback(async (branchId: number) => {
    setLoadingInv(true);
    try {
      const res = await apiClient.GET("/api/v1/inventory/branches/{branchId}", {
        params: { path: { branchId } }
      });
      const map = new Map<number, any>();
      (res.data ?? []).forEach((item: any) => {
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
      const res = await apiClient.GET("/api/v1/inventory/movements" as any, {});
      const allMovements = (res.data ?? []) as any[];
      
      let filtered = allMovements.filter(m => m.branchId === selectedBranchId);
      if (selectedProductId !== "all") {
        filtered = filtered.filter(m => m.productId === parseInt(selectedProductId));
      }
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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

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
  const getProductUnit = (id: number) => products.find(p => p.id === id)?.unitAbbreviation || "UND";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => {
        const inv = inventoryMap.get(p.id!);
        return (
          p.sku?.toLowerCase().includes(lowerSearch) ||
          p.nombre?.toLowerCase().includes(lowerSearch) ||
          p.unitAbbreviation?.toLowerCase().includes(lowerSearch) ||
          inv?.stockActual?.toString().includes(lowerSearch) ||
          p.precioVenta?.toString().includes(lowerSearch)
        );
      });
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let valA: any = (a as any)[sortConfig.key];
        let valB: any = (b as any)[sortConfig.key];
        if (sortConfig.key === "stockActual") {
          valA = inventoryMap.get(a.id!)?.stockActual ?? 0;
          valB = inventoryMap.get(b.id!)?.stockActual ?? 0;
        } else if (sortConfig.key === "stockMinimo") {
          valA = inventoryMap.get(a.id!)?.stockMinimo ?? 0;
          valB = inventoryMap.get(b.id!)?.stockMinimo ?? 0;
        }
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [products, inventoryMap, searchTerm, sortConfig]);

  if (loadingInit) return <Spinner fullPage />;

  return (
    <div style={{ padding: "var(--page-padding)", maxWidth: "1400px", margin: "0 auto" }}>
      <PageHeader
        title="Centro de Control de Inventario"
        description="Gestión inmutable de stock, auditoría de Kardex y niveles críticos por sucursal."
      />

      <div className="w-full">
        <Toolbar
          className="mb-16"
          left={
            <>
              <div className="w-[320px]">
                <Select
                  label="Sucursal de Consulta"
                  value={selectedBranchId}
                  onChange={(val) => setSelectedBranchId(val)}
                  options={branches.map(b => ({ value: b.id!, label: b.nombre! }))}
                  icon={<Info size={14} className="text-[var(--brand-400)]" />}
                />
              </div>

                <div className="flex gap-2 bg-[var(--bg-card)] p-1 rounded-xl  shadow-sm">
                  <Button 
                    variant={activeTab === "matrix" ? "primary" : "ghost"} 
                    size="sm"
                    onClick={() => setActiveTab("matrix")}
                    style={{ borderRadius: "10px", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}
                  >
                    Matriz de Stock
                  </Button>
                  <Button 
                    variant={activeTab === "kardex" ? "primary" : "ghost"} 
                    size="sm"
                    onClick={() => setActiveTab("kardex")}
                    style={{ borderRadius: "10px", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}
                  >
                    Kardex Histórico
                  </Button>
                </div>
            </>
          }
          right={
            <>
              {!canEdit && (
                <div className="px-4 py-2 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 flex items-center gap-2">
                  <Lock size={12} className="text-[var(--color-danger)]" />
                  <span className="text-[11px] text-[var(--color-danger)] font-black uppercase tracking-widest leading-none">Solo Lectura</span>
                </div>
              )}
            </>
          }
        >
          {activeTab === "matrix" && (
            <SearchFilter 
              placeholder="Buscar por SKU, nombre, unidad o stock..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          )}
        </Toolbar>

        <Separator />


        {activeTab === "matrix" && (
          <div className="mt-12 outline-none">
            <Card className="p-0 overflow-hidden border-[var(--neutral-800)] bg-[var(--bg-card)] shadow-2xl">
              <DataTable<ProductResponse>
                sortConfig={sortConfig}
                onSort={handleSort}
                columns={[
                  {
                    header: "SKU",
                    key: "sku",
                    width: "120px",
                    sortable: true,
                    render: (p) => (
                      <span className="tabular" style={{ fontSize: "12px", color: "var(--brand-400)", fontWeight: 700 }}>{p.sku}</span>
                    )
                  },
                  {
                    header: "Producto",
                    key: "nombre",
                    sortable: true,
                    render: (p) => (
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--neutral-100)", textTransform: "uppercase" }}>{p.nombre}</span>
                    )
                  },
                  {
                    header: "Unit.",
                    key: "unitAbbreviation",
                    align: "center",
                    sortable: true,
                    render: (p) => (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase" }}>{p.unitAbbreviation || "UND"}</span>
                    )
                  },
                  {
                    header: "Stock Actual",
                    key: "stockActual",
                    align: "right",
                    sortable: true,
                    render: (p) => {
                      const inv = inventoryMap.get(p.id!);
                      return (
                        <div className="flex flex-col gap-1 items-end">
                           <span className="tabular" style={{ fontSize: "16px", fontWeight: 900, color: "var(--neutral-50)" }}>
                            {inv?.stockActual ?? 0}
                          </span>
                          <StockStatus current={inv?.stockActual ?? 0} min={inv?.stockMinimo ?? 10} max={100} size="sm" />
                        </div>
                      );
                    }
                  },
                  {
                    header: "Stock Mín.",
                    key: "stockMinimo",
                    align: "right",
                    sortable: true,
                    render: (p) => {
                      const inv = inventoryMap.get(p.id!);
                      return <span className="tabular" style={{ fontSize: "13px", fontWeight: 600, color: "var(--neutral-400)" }}>{inv?.stockMinimo ?? 0}</span>;
                    }
                  },
                  {
                    header: "Acciones",
                    key: "actions",
                    align: "right",
                    render: (p) => (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustData({ type: "INGRESO", quantity: 0, reason: "", unitCost: p.costoPromedio ?? 0 });
                          }}
                        >
                          Acciones
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const inv = inventoryMap.get(p.id!);
                            if (inv) {
                                setConfigProduct({ p, inv });
                                setMinStockValue(inv.stockMinimo ?? 0);
                            }
                          }}
                        >
                          Ajustar stock minimo
                        </Button>
                      </div>
                    )
                  }
                ]}
                data={filteredAndSortedProducts}
                isLoading={loadingInv}
              />
            </Card>
          </div>
        )}

        {activeTab === "kardex" && (
          <div className="mt-12 outline-none">
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
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
              <DataTable<InventoryMovementExtended>
                columns={[
                  {
                    header: "Fecha y Hora",
                    key: "date",
                    render: (m) => <span style={{ fontSize: "13px", color: "var(--neutral-400)" }}>{new Date(m.date).toLocaleString("es-CO", { hour12: true, dateStyle: 'short', timeStyle: 'short' })}</span>
                  },
                  {
                    header: "Producto",
                    key: "productId",
                    render: (m) => <span style={{ fontSize: "14px", fontWeight: 600 }}>{getProductName(m.productId)}</span>
                  },
                  {
                    header: "Tipo",
                    key: "type",
                    render: (m) => <Badge variant={m.type === "INGRESO" ? "success" : "danger"}>{m.type}</Badge>
                  },
                  {
                    header: "Motivo",
                    key: "reason",
                  },
                  {
                    header: "Cantidad",
                    key: "quantity",
                    align: "right",
                    render: (m) => (
                      <span style={{ fontWeight: 700, color: m.type === "INGRESO" ? "var(--color-success)" : "var(--color-danger)" }}>
                        {m.type === "INGRESO" ? "+" : "-"}{m.quantity}
                      </span>
                    )
                  },
                  {
                    header: "Saldo Resultante",
                    key: "finalBalance",
                    align: "right",
                    render: (m) => (
                      <span style={{ fontWeight: 800, color: "var(--neutral-100)" }}>
                        {m.finalBalance} <small style={{ color: "var(--neutral-500)" }}>{getProductUnit(m.productId)}</small>
                      </span>
                    )
                  }
                ]}
                data={kardexMovements}
                isLoading={kardexLoading}
                emptyState={{
                  title: "Sin movimientos",
                  description: "No se han registrado transacciones de inventario para estos filtros.",
                  icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                }}
              />
            </Card>
          </div>
          </div>
        )}
      </div>

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
                borderColor: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--neutral-800)",
                background: adjustData.type === "INGRESO" ? "color-mix(in srgb, var(--color-success), transparent 90%)" : "transparent",
                color: adjustData.type === "INGRESO" ? "var(--color-success)" : "var(--neutral-500)"
              }}
            >
              ENTRADA (+)
            </button>
            <button 
              onClick={() => setAdjustData({...adjustData, type: "RETIRO"})}
              style={{
                padding: "16px", borderRadius: "12px", border: "2px solid", cursor: "pointer", fontWeight: 700,
                borderColor: adjustData.type === "RETIRO" ? "var(--color-danger)" : "var(--neutral-800)",
                background: adjustData.type === "RETIRO" ? "color-mix(in srgb, var(--color-danger), transparent 90%)" : "transparent",
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
