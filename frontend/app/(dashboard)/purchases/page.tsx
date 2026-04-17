"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Package, TrendingUp, Search, Plus, Trash2, 
  ShoppingCart, Building2, Calendar, DollarSign,
  CheckCircle, ArrowRight, Truck, Minus, Tag
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { apiClient } from "@/api/client";
import { useToast } from "@/context/ToastContext";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

// Interfaces Locales
interface Product {
  id: number;
  sku: string;
  nombre: string;
  costoPromedio: number;
  precioVenta: number;
  proveedorId: number;
}

interface PurchaseDetail {
  productId: number;
  nombre: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: number;
  supplierId: number;
  branchId: number;
  requestDate: string;
  estimatedArrivalDate: string;
  actualArrivalDate: string | null;
  receptionStatus: "PENDING" | "IN_TRANSIT" | "RECEIVED_TOTAL";
  paymentStatus: "POR_PAGAR" | "PAGADO";
  total: number;
}

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<"history" | "new">("new");
  const { showToast } = useToast();

  // Datos base
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Histórico
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Formulario Nueva Orden
  const [supplierId, setSupplierId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [estimatedArrival, setEstimatedArrival] = useState<string>("");
  
  // Carrito de Orden
  const [cart, setCart] = useState<PurchaseDetail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCatalogs();
    fetchOrders();
  }, []);

  const fetchCatalogs = async () => {
    try {
      const [supsRes, branchRes, prodRes] = await Promise.all([
        (apiClient.GET as any)("/api/catalog/suppliers", {}),
        (apiClient.GET as any)("/api/branches", {}),
        (apiClient.GET as any)("/api/catalog/products", {})
      ]);
      if (supsRes.data) setSuppliers(supsRes.data as any[]);
      if (branchRes.data) setBranches(branchRes.data as any[]);
      if (prodRes.data) setProducts(prodRes.data as Product[]);
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await (apiClient.GET as any)("/api/v1/purchases", {});
      if (res.data) setOrders(res.data);
    } catch (error) {
      console.error("Error al cargar historial de compras:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    if (supplierId) {
      result = result.filter(p => p.proveedorId === parseInt(supplierId));
    }

    if (searchTerm) {
      result = result.filter(item => 
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return result;
  }, [products, searchTerm, supplierId]);

  // ----- MÉTODOS DEL CARRITO DE COMPRAS ----- //
  const addToCart = (prod: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === prod.id);
      if (existing) {
        return prev.map(item => item.productId === prod.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        productId: prod.id,
        nombre: prod.nombre,
        sku: prod.sku,
        quantity: 1,
        unitPrice: prod.costoPromedio || 0 // Iniciamos la negociación con el costo actual
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const setQuantity = (productId: number, value: number) => {
    if (value < 1) return;
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: value } : item));
  };

  const setUnitPrice = (productId: number, newPrice: number) => {
    if (newPrice < 0) return;
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, unitPrice: newPrice } : item));
  };

  const clearCart = () => {
    if (confirm("¿Estás seguro de descartar el borrador entero?")) {
      setCart([]);
    }
  };

  const financialSummary = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  }, [cart]);

  const handleSubmitOrder = async () => {
    if (!supplierId || !branchId || !estimatedArrival) {
      return showToast("Faltan datos en la cabecera (Proveedor, Destino o Fecha)", "warning");
    }

    if (cart.length === 0) {
      return showToast("Debes añadir mercancía a la solicitud desde el catálogo", "warning");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: 1, // Simulado (En producción sale de session)
        supplierId: parseInt(supplierId),
        branchId: parseInt(branchId),
        estimatedArrivalDate: new Date(estimatedArrival).toISOString(),
        items: cart.map(l => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice
        }))
      };

      const res = await (apiClient.POST as any)("/api/v1/purchases", { body: payload });
      if (res.error) throw res.error;
      
      showToast("Orden de compra creada exitosamente", "success");
      
      // Reset State
      setSupplierId("");
      setBranchId("");
      setEstimatedArrival("");
      setCart([]);
      setActiveTab("history");
      fetchOrders();
    } catch (error) {
      console.error(error);
      showToast("Error al procesar la Orden Logística", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const receiveOrder = async (orderId: number) => {
    try {
      const res = await (apiClient.POST as any)(`/api/v1/purchases/${orderId}/receive`, {
        params: { query: { userId: 1 } }
      });
      if (res.error) throw res.error;
      showToast("Inventario Alimentado y Costos Financieros Promediados 🪄", "success");
      fetchOrders();
    } catch (error) {
      showToast("Error al registrar la recepción logística", "error");
    }
  };

  // ----- SUB COMPONENTES UI POS-STYLE ----- //
  const QuantitySelector = ({ value, onIncrease, onDecrease, onChange }: any) => (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      background: "var(--bg-surface)", 
      border: "1px solid var(--border-default)",
      borderRadius: "8px",
      overflow: "hidden",
      height: "32px"
    }}>
      <button 
        onClick={onDecrease}
        style={{ width: "28px", height: "100%", border: "none", background: "none", cursor: "pointer", color: "var(--neutral-400)", display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <Minus size={14} />
      </button>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        style={{ 
          width: "32px", 
          textAlign: "center", 
          border: "none", 
          background: "none", 
          color: "var(--neutral-50)", 
          fontSize: "12px", 
          fontWeight: 700,
          outline: "none",
          appearance: "none",
          margin: 0
        }}
      />
      <button 
        onClick={onIncrease}
        style={{ width: "28px", height: "100%", border: "none", background: "none", cursor: "pointer", color: "var(--neutral-400)", display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <Plus size={14} />
      </button>
    </div>
  );

  const ProductCatalogCard = ({ p }: { p: Product }) => (
    <div 
      onClick={() => addToCart(p)}
      className="cursor-pointer group flex flex-col justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-brand-500/50 hover:bg-neutral-800/60 transition-all shadow-sm"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-white leading-tight group-hover:text-brand-400 transition-colors">{p.nombre}</h3>
        </div>
        <p className="text-[10px] font-mono text-neutral-500 tracking-wider mb-4 border border-neutral-800 p-1 rounded bg-neutral-950 inline-block">
          REF: {p.sku}
        </p>
      </div>
      <div className="flex justify-between items-end border-t border-neutral-800/80 pt-3">
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-neutral-500">Costo Ref.</span>
            <span className="text-sm font-black text-white">{formatCurrency(p.costoPromedio || 0)}</span>
        </div>
        <div className="h-8 w-8 bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white rounded-lg flex items-center justify-center transition-colors">
            <Plus size={16} />
        </div>
      </div>
    </div>
  );

  const PurchaseItemCard = ({ item }: { item: PurchaseDetail }) => (
    <div style={{ 
      padding: "16px",
      background: "var(--bg-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      animation: "fadeIn 0.3s ease-out"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--neutral-50)", margin: 0, lineHeight: 1.2 }}>{item.nombre}</h4>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--neutral-500)", fontFamily: "var(--font-mono)" }}>{item.sku}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "15px", fontWeight: 900, color: "var(--brand-400)", margin: 0 }}>
             {formatCurrency(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
        <QuantitySelector 
          value={item.quantity}
          onIncrease={() => updateQuantity(item.productId, 1)}
          onDecrease={() => updateQuantity(item.productId, -1)}
          onChange={(val: number) => setQuantity(item.productId, val)}
        />
        
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          background: "var(--bg-surface)", 
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
          padding: "0 10px",
          height: "32px",
          gap: "8px",
          transition: "border-color 0.2s"
        }}
        className="focus-within:border-brand-500/50"
        >
          <DollarSign size={14} className="text-neutral-500" />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase" }}>Costo U.</span>
          <input 
            type="number"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => setUnitPrice(item.productId, parseFloat(e.target.value) || 0)}
            style={{ 
              flex: 1, 
              background: "none", 
              border: "none", 
              color: "var(--neutral-50)", 
              fontSize: "13px", 
              fontWeight: 800, 
              textAlign: "right", 
              outline: "none" 
            }}
          />
        </div>

        <button 
          onClick={() => removeFromCart(item.productId)}
          style={{ 
            width: "32px", 
            height: "32px", 
            borderRadius: "8px", 
            border: "1px solid rgba(224,112,112,0.2)", 
            background: "rgba(224,112,112,0.05)", 
            color: "var(--color-danger)",
            cursor: "pointer",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-danger)", e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(224,112,112,0.05)", e.currentTarget.style.color = "var(--color-danger)")}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  // ----- RENDERIZADO DEL HISTÓRICO ----- //
  const renderHistory = () => (
    <Card title="Diario de Transacciones Logísticas (Adquisiciones)">
      {isLoadingOrders ? (
        <div className="flex justify-center p-10"><Spinner size={40} /></div>
      ) : (
        <DataTable
            columns={[
              { header: "No. Doc.", key: "id" },
              { header: "Comercializadora / Proveedor", key: "supplier" },
              { header: "Operaciones Destino", key: "branch" },
              { header: "Esperado para", key: "date" },
              { header: "Ruta / Estado", key: "estado" },
              { header: "Inversión", key: "total", align: "right" },
              { header: "Tracking Actions", key: "acciones", align: "right" }
            ]}
            data={orders.map(o => ({
              id: <span className="font-mono font-bold text-neutral-400">#{String(o.id).padStart(5, '0')}</span>,
              supplier: suppliers.find(s => s.id === o.supplierId)?.nombre || "N/A",
              branch: branches.find(b => b.id === o.branchId)?.nombre || "N/A",
              date: new Date(o.estimatedArrivalDate).toLocaleDateString(),
              estado: (
                <Badge variant={o.receptionStatus === "PENDING" ? "warning" : o.receptionStatus === "IN_TRANSIT" ? "info" : "success"} dot>
                  {o.receptionStatus}
                </Badge>
              ),
              total: <span className="font-bold text-neutral-50 tracking-tight">{formatCurrency(o.total)}</span>,
              acciones: (
                 <div className="flex gap-2 justify-end">
                    {o.receptionStatus === "PENDING" && (
                         <Button size="sm" variant="ghost" className="border-neutral-700 hover:bg-brand-500/10 hover:text-brand-400" onClick={() => {
                             (apiClient.POST as any)(`/api/v1/purchases/${o.id}/dispatch`).then(() => fetchOrders());
                         }}>
                             <Truck className="h-4 w-4 mr-2" /> Enviar Logística
                         </Button>
                    )}
                    {o.receptionStatus === "IN_TRANSIT" && (
                         <Button size="sm" variant="primary" onClick={() => receiveOrder(o.id)}>
                             <CheckCircle className="h-4 w-4 mr-2" /> Ingestar Stock (Inventario)
                         </Button>
                    )}
                    {o.receptionStatus === "RECEIVED_TOTAL" && (
                         <div className="text-[10px] uppercase font-bold text-emerald-500 flex items-center pr-2"><CheckCircle className="h-3 w-3 mr-1"/> Completada</div>
                    )}
                 </div>
              )
            }))}
        />
      )}
    </Card>
  );

  // ----- RENDERIZADO DUAL-PANE POS-STYLE (Nueva Orden) ----- //
  const renderDualPaneOrder = () => (
    <main className="flex gap-6 flex-col lg:flex-row h-[75vh] animate-in fade-in zoom-in-95 duration-300">
        {/* PANEL IZQUIERDO: Búsqueda y Catálogo */}
        <div className="flex flex-[2] flex-col gap-5 min-w-0 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Package className="text-brand-500" /> Mercado B2B
                  </h1>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Añade stock pactado a la orden</p>
                </div>
                <div className="w-full md:w-72">
                    <Input
                        icon={<Search className="h-4 w-4 text-brand-500" />}
                        placeholder="Buscar material o SKU..."
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(p => <ProductCatalogCard key={p.id} p={p} />)}
                </div>
                {filteredProducts.length === 0 && (
                   <EmptyState 
                       icon={<Search size={40} />}
                       title="Catálogo Vacío"
                       description="No se han encontrado productos base en tu sistema con esos términos."
                   />
                )}
            </div>
        </div>

        {/* PANEL DERECHO: Solicitud Borrador */}
        <div className="flex w-full lg:w-[480px] flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden relative">
            {/* Header: Metadatos de Orden */}
            <div className="flex flex-col gap-3 p-5 bg-neutral-900 border-b border-neutral-800 shadow-md z-10">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="font-black text-neutral-100 uppercase tracking-tight flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-brand-500" /> Orden de Suministro
                    </h2>
                    {cart.length > 0 && (
                        <button className="text-[10px] uppercase font-black text-red-500/70 hover:text-red-400" onClick={clearCart}>Limpiar</button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Select
                        value={supplierId}
                        onChange={(val) => {
                            if (cart.length > 0 && confirm("Cambiar de proveedor vaciará los productos actuales en la solicitud. ¿Confirmas?")) {
                                setCart([]);
                                setSupplierId(val);
                            } else if (cart.length === 0) {
                                setSupplierId(val);
                            }
                        }}
                        options={[{ value: "", label: "TODOS LOS PROVEEDORES" }, ...suppliers.map(s => ({ value: String(s.id), label: s.nombre }))]}
                    />
                    <Select
                        value={branchId}
                        onChange={setBranchId}
                        options={[{ value: "", label: "DESTINO" }, ...branches.map(b => ({ value: String(b.id), label: b.nombre }))]}
                    />
                </div>
                <div>
                   <Input
                        type="date"
                        value={estimatedArrival}
                        onChange={(e: any) => setEstimatedArrival(e.target.value)}
                        icon={<Calendar size={14} className="text-brand-500" />}
                    />
                </div>
            </div>

            {/* Listado de Productos Negociados */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-neutral-950 flex flex-col gap-3">
                {cart.length > 0 ? (
                    cart.map(item => <PurchaseItemCard key={item.productId} item={item} />)
                ) : (
                    <div className="h-full flex items-center justify-center opacity-70">
                       <EmptyState 
                          icon={<ShoppingCart size={32} />}
                          title="Sin Ítems Logísticos"
                          description="Elige productos de la izquierda para conformar la solicitud al mayorista."
                       />
                    </div>
                )}
            </div>

            {/* Subtotal y Checkout Footer */}
            <div className="p-6 border-t border-neutral-800 bg-neutral-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10 flex flex-col gap-4">
                <div className="flex justify-between items-end border-b border-neutral-700/50 pb-4 border-dashed">
                    <span className="text-xs uppercase font-black text-neutral-500 tracking-widest">Inversión Final</span>
                    <span className="text-3xl font-black text-brand-400" style={{ textShadow: "0 0 25px var(--brand-glow)" }}>
                        {formatCurrency(financialSummary)}
                    </span>
                </div>
                <Button 
                    className="w-full h-14 text-sm tracking-widest bg-brand-600 hover:bg-brand-500 text-white border-0 shadow-[0_10px_30px_rgba(235,108,31,0.2)] hover:shadow-[0_10px_40px_rgba(235,108,31,0.4)]"
                    variant="primary"
                    onClick={handleSubmitOrder}
                    loading={isSubmitting}
                >
                    <div className="flex items-center gap-2 font-black uppercase">
                        Autorizar Solicitud Inmediata <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                </Button>
            </div>
        </div>
    </main>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
        <PageHeader 
            title={
                <>
                  Gestor de <em>Abastecimiento</em>
                </>
            }
            description="Control total B2B. Cada lote recibido reconstruye fiscalmente tu Costo Promedio Ponderado de inventario."
            actions={
                <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-lg w-max shadow-inner">
                    <button
                        className={`flex items-center gap-2 px-5 py-2 rounded text-[11px] uppercase tracking-wider font-bold transition-all ${
                            activeTab === "history" 
                                ? "bg-neutral-800 text-white shadow-sm" 
                                : "text-neutral-500 hover:text-neutral-300"
                        }`}
                        onClick={() => setActiveTab("history")}
                    >
                        <TrendingUp size={14} /> Diario Histórico
                    </button>
                    <button
                        className={`flex items-center gap-2 px-5 py-2 rounded text-[11px] uppercase tracking-wider font-bold transition-all ${
                            activeTab === "new" 
                                ? "bg-brand-500 text-white shadow-[0_0_15px_var(--brand-glow)]" 
                                : "text-neutral-500 hover:text-neutral-300"
                        }`}
                        onClick={() => setActiveTab("new")}
                    >
                        <ShoppingCart size={14} /> Nueva Negociación
                    </button>
                </div>
            }
        />

        {activeTab === "history" ? renderHistory() : renderDualPaneOrder()}

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--neutral-800); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--neutral-700); }
        `}</style>
    </div>
  );
}
