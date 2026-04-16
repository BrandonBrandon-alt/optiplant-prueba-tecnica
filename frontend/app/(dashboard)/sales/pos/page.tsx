"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/api/client";
import { getSession, type AuthSession } from "@/api/auth";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { Search, ShoppingCart, Tag, Trash2, Plus, Minus, Package, User, Store, CheckCircle, Printer, XCircle } from "lucide-react";
import SaleReceipt from "@/components/sales-history/SaleReceipt";

interface InventoryItem {
  id: number;
  productId: number;
  productoNombre: string;
  sku: string;
  stockActual: number;
  precioVenta: number;
}

interface CartItem {
  productId: number;
  nombre: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  stockAvailable: number;
}

export default function POSPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const sess = getSession();
    if (!sess) {
      router.push("/login");
      return;
    }
    setSession(sess);

    const fetchData = async () => {
      try {
        if (sess.sucursalId) {
          const { data } = await apiClient.GET("/api/v1/inventory/branches/{branchId}", {
            params: { path: { branchId: sess.sucursalId } }
          });
          if (data) {
            setInventory(data as unknown as InventoryItem[]);
          }
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        showToast("Error al cargar el inventario local.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, showToast]);

  const filteredProducts = useMemo(() => {
    return inventory.filter(item => 
      item.productoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const addToCart = (product: InventoryItem) => {
    if (product.stockActual <= 0) {
      showToast("Este producto no tiene stock disponible.", "error");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.productId);
      if (existing) {
        if (existing.quantity >= product.stockActual) {
          showToast(`Solo hay ${product.stockActual} unidades disponibles.`, "warning");
          return prev;
        }
        return prev.map(item => 
          item.productId === product.productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        productId: product.productId,
        nombre: product.productoNombre,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.precioVenta,
        discountPercentage: 0,
        stockAvailable: product.stockActual
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm("¿Estás seguro de vaciar el carrito?")) {
      setCart([]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > item.stockAvailable) {
          showToast(`Límite de stock: ${item.stockAvailable} unidades.`, "warning");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const setQuantity = (productId: number, value: number) => {
    if (value < 1) return;
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        if (value > item.stockAvailable) {
          showToast(`Límite de stock: ${item.stockAvailable} unidades.`, "warning");
          return { ...item, quantity: item.stockAvailable };
        }
        return { ...item, quantity: value };
      }
      return item;
    }));
  };

  const updateDiscount = (productId: number, percentage: number) => {
    if (percentage < 0 || percentage > 100) return;
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, discountPercentage: percentage } : item
    ));
  };

  const financials = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const totalFinal = cart.reduce((acc, item) => {
      const base = item.unitPrice * item.quantity;
      const discount = base * (item.discountPercentage / 100);
      return acc + (base - discount);
    }, 0);
    const totalDiscount = subtotal - totalFinal;

    return { subtotal, totalDiscount, totalFinal };
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        branchId: session?.sucursalId,
        userId: session?.id,
        customerName: customerName.trim() || null,
        customerDocument: customerDocument.trim() || null,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discountPercentage: item.discountPercentage
        }))
      };

      const { data } = await apiClient.POST("/api/v1/sales", { body: payload as any });
      const saleData = data as any;
      setLastSaleId(saleData.id);
      showToast("Venta procesada exitosamente.", "success");
      setCart([]);
      setCustomerName("");
      setCustomerDocument("");
      setShowSuccessModal(true);
      
      // Refresh inventory
      if (session?.sucursalId) {
        const { data } = await apiClient.GET("/api/v1/inventory/branches/{branchId}", {
          params: { path: { branchId: session.sucursalId } }
        });
        if (data) {
          setInventory(data as unknown as InventoryItem[]);
        }
      }
    } catch (error: any) {
      showToast(error.message || "Error al procesar la venta.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setLastSaleId(null);
  };

  const currentSaleData = useMemo(() => {
    if (!lastSaleId) return null;
    return {
      id: lastSaleId,
      date: new Date().toISOString(),
      subtotal: financials.subtotal,
      totalDiscount: financials.totalDiscount,
      totalFinal: financials.totalFinal,
      customerName: "", // We don't have the full object here but we can pass what we had
      customerDocument: "",
      details: cart.map((item, idx) => ({
        id: idx,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceApplied: item.unitPrice,
        discountPercentage: item.discountPercentage,
        subtotalLine: (item.unitPrice * item.quantity) * (1 - item.discountPercentage / 100)
      }))
    };
  }, [lastSaleId]);


  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

  if (loading) return <div className="flex h-screen items-center justify-center bg-neutral-950"><Spinner size={48} /></div>;

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-neutral-50 overflow-hidden">
      {/* Header POS */}
      <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 shadow-lg shadow-brand-600/20">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Terminal POS</h1>
            <p className="mt-1 text-xs text-neutral-400">Terminal de Punto de Venta Profesional</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-neutral-200">{session?.nombre}</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{session?.rol}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <User className="h-4 w-4 text-neutral-400" />
            </div>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div className="flex items-center gap-2 text-brand-400">
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">Sucursal Local</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 md:p-6 gap-4 md:gap-6 flex-col lg:flex-row">
        {/* Panel Izquierdo: Catálogo */}
        <div className="flex flex-[2] flex-col gap-4 overflow-hidden min-w-0">
            <Input
              label="Búsqueda de Productos"
              icon={<Search className="h-4 w-4 text-neutral-500" />}
              placeholder="Buscar por nombre o SKU..."
              className="h-11 bg-neutral-900 border-neutral-800 focus:border-brand-500 transition-all"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((item) => (
                <Card 
                  key={item.id} 
                  className={`p-5 cursor-pointer transition-all border-neutral-800 bg-neutral-900 hover:border-brand-500 hover:shadow-[0_0_20px_rgba(235,108,31,0.15)] group relative overflow-hidden ${item.stockActual <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                  onClick={() => addToCart(item)}
                >
                  <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-brand-500 text-white p-1 rounded-bl-lg shadow-lg">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={item.stockActual > 10 ? "success" : "warning"}>
                      {item.stockActual} en stock
                    </Badge>
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">{item.sku}</span>
                  </div>
                  
                  <h3 className="font-bold text-neutral-100 group-hover:text-brand-400 transition-colors line-clamp-2 min-h-[3rem] text-lg">
                    {item.productoNombre}
                  </h3>
                  
                  <div className="mt-6 flex items-baseline justify-between">
                    <div>
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">Precio Unitario</p>
                        <span className="text-xl font-black text-white">
                          {formatCurrency(item.precioVenta)}
                        </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <Package className="h-12 w-12 mb-4 opacity-20" />
                <p>No se encontraron productos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Carrito */}
        <div className="flex w-full lg:w-[450px] flex-col rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5 bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <div className="bg-brand-500/10 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <h2 className="font-black text-neutral-100 uppercase tracking-tight">Carrito de Venta</h2>
                <button 
                  onClick={clearCart}
                  className="text-[10px] text-neutral-500 hover:text-red-400 font-bold uppercase transition-colors"
                >
                  Vaciar Todo
                </button>
              </div>
            </div>
            <Badge variant="neutral">{cart.length} productos</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.productId} className="group relative flex flex-col gap-3 rounded-lg bg-neutral-950 p-4 border border-neutral-800/80 hover:border-brand-500/30 transition-all">
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-10 shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-neutral-50 leading-tight">{item.nombre}</p>
                    <p className="text-[10px] text-brand-500 font-mono mt-1">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                    {item.discountPercentage > 0 && (
                      <p className="text-[10px] text-emerald-500 font-bold">-{item.discountPercentage}% OFF</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 gap-4">
                  <div className="flex items-center border-2 border-neutral-800 rounded-lg overflow-hidden bg-neutral-900 group-within:border-brand-500/50 transition-colors">
                    <button 
                      className="h-9 w-9 flex items-center justify-center hover:bg-neutral-800 text-neutral-100 transition-colors"
                      onClick={() => updateQuantity(item.productId, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="w-12 bg-transparent text-sm font-black text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      className="h-9 w-9 flex items-center justify-center hover:bg-neutral-800 text-neutral-100 transition-colors"
                      onClick={() => updateQuantity(item.productId, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center gap-2 bg-neutral-900 border-2 border-neutral-800 rounded-lg px-3 h-9 group-within:border-emerald-500/50 transition-colors">
                    <Tag className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">Dto</span>
                    <input
                      type="number"
                      value={item.discountPercentage}
                      onChange={(e) => updateDiscount(item.productId, parseInt(e.target.value) || 0)}
                      className="flex-1 bg-transparent text-sm font-black focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                      max="100"
                    />
                    <span className="text-xs font-bold text-neutral-500">%</span>
                  </div>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 text-neutral-500 opacity-40 py-20">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p className="text-sm">El carrito está vacío</p>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-800 bg-neutral-900/90 p-6 space-y-4">
            {/* Información del Cliente */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Cliente (Opcional)</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre Cliente"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-xs focus:border-brand-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Documento</label>
                <input 
                  type="text" 
                  value={customerDocument}
                  onChange={(e) => setCustomerDocument(e.target.value)}
                  placeholder="NIT / CC"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-xs focus:border-brand-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold text-neutral-400">
              <span>Subtotal</span>
              <span className="text-neutral-100">{formatCurrency(financials.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-emerald-500">
              <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> Descuento Total</span>
              <span>- {formatCurrency(financials.totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-neutral-50 pt-4 border-t-2 border-neutral-800 border-dashed">
              <span>TOTAL</span>
              <span className="text-brand-500 drop-shadow-[0_0_10px_rgba(235,108,31,0.3)]">{formatCurrency(financials.totalFinal)}</span>
            </div>
            
            <Button 
              className="mt-6 w-full h-14 text-lg font-black bg-brand-600 hover:bg-brand-500 shadow-[0_10px_20px_rgba(235,108,31,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleCheckout}
            >
              {isSubmitting ? <Spinner size={20} /> : <div className="flex items-center gap-3"><ShoppingCart className="h-6 w-6" /> <span>PROCESAR VENTA</span></div>}
            </Button>
          </div>
        </div>
      </main>

      {/* Modal de Éxito con Recibo */}
      {showSuccessModal && lastSaleId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl scale-in-center">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <h2 className="text-xl font-bold">¡Venta Exitosa!</h2>
                </div>
                <button onClick={handleCloseModal} className="text-neutral-500 hover:text-white transition-colors">
                    <XCircle className="h-6 w-6" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-900 custom-scrollbar">
                <div className="flex flex-col items-center mb-6">
                    <p className="text-neutral-400 text-center mb-4">La transacción se ha registrado correctamente. ¿Deseas imprimir el comprobante?</p>
                    <div className="scale-90 origin-top bg-white rounded-sm shadow-xl overflow-hidden">
                        {/* Mocking the data for preview since we just finished the sale */}
                        <SaleReceipt sale={{
                             id: lastSaleId,
                             date: new Date().toISOString(),
                             subtotal: financials.subtotal,
                             totalDiscount: financials.totalDiscount,
                             totalFinal: financials.totalFinal,
                             customerName: "", 
                             customerDocument: "",
                             details: [] // Simplified for preview or we need to pass the real ones before clearing
                        }} />
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-neutral-800 flex gap-4 bg-neutral-950/50">
                <Button 
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center gap-2"
                    onClick={handleCloseModal}
                >
                    Cerrar
                </Button>
                <Button 
                    className="flex-1 bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2"
                    onClick={handlePrint}
                >
                    <Printer className="h-5 w-5" />
                    Imprimir Ticket
                </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--neutral-800);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--neutral-700);
        }
      `}</style>
    </div>
  );
}
