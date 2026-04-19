import React from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Spinner from "@/components/ui/Spinner";
import { 
  Package, Search, Plus, ShoppingCart, 
  Trash2, DollarSign, Percent, ArrowRight
} from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

const ProductCard = ({ product, onAdd }: { product: any; onAdd: (p: any) => void }) => (
  <div 
    onClick={() => onAdd(product)}
    className="group bg-[var(--bg-card)] border border-[var(--neutral-700)] hover:border-[var(--brand-500)] shadow-md hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-[1.5rem] p-6 cursor-pointer flex flex-col justify-between h-full transition-all duration-300 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="bg-[var(--brand-500)] text-[var(--neutral-50)] p-1 rounded-bl-lg shadow-lg">
        <Plus className="h-4 w-4" />
      </div>
    </div>
    
    <div>
      <span className="text-[10px] font-mono text-[var(--neutral-500)] font-black tracking-[0.2em] uppercase">{product.sku}</span>
      <h3 className="text-base font-black text-[var(--neutral-100)] mt-1 group-hover:text-[var(--brand-400)] transition-colors leading-tight uppercase tracking-tight line-clamp-2 min-h-[3rem]">
        {product.nombre}
      </h3>
    </div>
    
    <div className="mt-6 flex items-baseline justify-between">
      <div className="flex flex-col">
        <p className="text-[10px] text-[var(--neutral-500)] uppercase font-black tracking-tighter mb-1">Costo ERP</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-[var(--neutral-50)]">
            {formatCurrency(product.costoPromedio || 0)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const CartItemRow = ({ item, actions }: { item: any, actions: any }) => (
  <div className="p-4 bg-[var(--bg-card)] border border-[var(--neutral-800)] rounded-2xl flex flex-col gap-3 transition-all animate-in fade-in slide-in-from-right-2">
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1">
        <h4 className="text-[13px] font-black text-[var(--neutral-50)] leading-tight uppercase tracking-tight">{item.nombre}</h4>
        <span className="text-[10px] font-mono text-[var(--brand-400)] font-bold tracking-tight uppercase">{item.sku}</span>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-black text-[var(--neutral-50)]">{formatCurrency((Number(item.unitPrice) || 0) * item.quantity)}</p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="w-32">
        <QuantitySelector 
          value={item.quantity} 
          onIncrease={() => actions.updateQuantity(item.productId, 1)} 
          onDecrease={() => actions.updateQuantity(item.productId, -1)} 
          onChange={(val: number) => actions.setQuantity(item.productId, val)}
        />
      </div>
      
      <div className="flex-1 flex items-center bg-[var(--bg-surface)] border border-[var(--neutral-800)] rounded-xl px-2 h-9">
        <DollarSign size={12} className="text-[var(--brand-400)] mr-1" />
        <input 
          type="number" step="0.01" value={item.unitPrice} 
          onChange={(e) => actions.setUnitPrice(item.productId, e.target.value === "" ? "" : (parseFloat(e.target.value) || 0))}
          placeholder="0"
          className="flex-1 bg-transparent border-none text-[var(--neutral-100)] text-[12px] font-black focus:outline-none text-right"
        />
      </div>

      <div className="w-16 flex items-center bg-[var(--bg-surface)] border border-[var(--neutral-800)] rounded-xl px-2 h-9">
        <Percent size={10} className="text-[var(--brand-400)] mr-1" />
        <input 
          type="number" min="0" max="100" step="0.5" value={item.discountPct} 
          onChange={(e) => actions.setDiscount(item.productId, e.target.value === "" ? "" : (parseFloat(e.target.value) || 0))}
          placeholder="0"
          className={`w-full bg-transparent border-none text-[12px] font-black focus:outline-none text-center ${(Number(item.discountPct) || 0) > 0 ? 'text-[var(--brand-400)]' : 'text-[var(--neutral-500)]'}`}
        />
      </div>

      <button 
        onClick={() => actions.removeFromCart(item.productId)}
        className="w-9 h-9 flex items-center justify-center text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-xl transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>

    {(Number(item.discountPct) || 0) > 0 && (
      <div className="flex justify-between items-center px-3 py-1.5 bg-[var(--color-success)]/10 rounded-lg border border-dashed border-[var(--color-success)]/30">
        <span className="text-[9px] text-[var(--color-success)] font-black uppercase tracking-widest">Ahorro ({(Number(item.discountPct) || 0)}%)</span>
        <span className="text-[9px] text-[var(--color-success)] font-black">-{formatCurrency(item.quantity * (Number(item.unitPrice) || 0) * ((Number(item.discountPct) || 0) / 100))}</span>
      </div>
    )}
  </div>
);

interface NewPurchaseDraftProps {
  filteredProducts: any[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  cartActions: any;
  cart: any[];
  supplierId: string;
  setSupplierId: (v: string) => void;
  branchId: string;
  setBranchId: (v: string) => void;
  estimatedArrival: string;
  setEstimatedArrival: (v: string) => void;
  paymentDueDays: string;
  setPaymentDueDays: (v: string) => void;
  isSubmitting: boolean;
  handleSubmitOrder: () => void;
  financialSummary: number;
  suppliers: any[];
  branches: any[];
}

export default function NewPurchaseDraft({
  filteredProducts, searchTerm, setSearchTerm, cartActions, cart, 
  supplierId, setSupplierId, branchId, setBranchId, estimatedArrival, 
  setEstimatedArrival, paymentDueDays, setPaymentDueDays, 
  isSubmitting, handleSubmitOrder, financialSummary, suppliers, branches
}: NewPurchaseDraftProps) {
  return (
    <main className="flex gap-8 flex-col lg:flex-row h-[82vh] animate-in fade-in zoom-in-95 duration-300 mt-8">
      {/* ── PANEL IZQUIERDO: CATÁLOGO ───────────────── */}
      <div className="flex flex-[3] flex-col gap-5 min-w-0 bg-[var(--bg-surface)] border border-[var(--neutral-800)] rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-[var(--neutral-50)] tracking-tight uppercase leading-none">Catálogo de Abastecimiento</h3>
            <p className="text-[10px] text-[var(--neutral-500)] font-black uppercase tracking-[0.2em] mt-2">Selección estratégica de insumos</p>
          </div>
          
          <div className="w-full md:w-72">
            <Input 
              icon={<Search className="h-4 w-4 text-[var(--brand-500)]" />} 
              placeholder="Filtro rápido..." 
              value={searchTerm} 
              onChange={(e: any) => setSearchTerm(e.target.value)} 
              className="bg-[var(--bg-base)] border-[var(--neutral-800)]" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={cartActions.addToCart} />)}
          </div>
          {filteredProducts.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
              <Package size={64} strokeWidth={1} className="mb-4 text-[var(--neutral-500)]" />
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--neutral-400)]">Sin resultados en catálogo</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PANEL DERECHO: CHECKOUT ───────────────── */}
      <div className="flex w-full lg:w-[480px] flex-col rounded-3xl border border-[var(--neutral-800)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden relative">
        <div className="flex flex-col gap-4 border-b border-[var(--neutral-800)] px-6 py-5 bg-[var(--bg-card)]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--brand-500)]/10 p-2.5 rounded-xl border border-[var(--brand-500)]/20">
                <ShoppingCart className="h-5 w-5 text-[var(--brand-500)]" />
              </div>
              <div>
                <h2 className="font-black text-[var(--neutral-50)] text-base tracking-tight uppercase">Borrador de Negociación</h2>
                {cart.length > 0 && (
                  <button 
                    className="text-[10px] font-black text-[var(--neutral-500)] hover:text-[var(--color-danger)] transition-colors uppercase tracking-widest" 
                    onClick={cartActions.clearCart}
                  >
                    Descartar Todo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 custom-scrollbar bg-[var(--bg-card)]/20">
          {cart.map(item => (
            <CartItemRow key={item.productId} item={item} actions={cartActions} />
          ))}

          {cart.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <ShoppingCart size={40} className="mb-4 text-[var(--neutral-500)]" />
              <p className="text-sm font-bold text-center text-[var(--neutral-300)]">Carrito vacío</p>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--neutral-800)] bg-[var(--bg-card)]/90 p-5 space-y-3 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] block">
          
          <div className="grid grid-cols-2 gap-3 mb-2">
            <Select 
              label="Socio Comercial" 
              value={supplierId} 
              onChange={setSupplierId} 
              options={[
                { value: "", label: "Seleccionar Proveedor" },
                ...suppliers.map(s => ({ value: String(s.id), label: s.nombre }))
              ]} 
            />
            <Select 
              label="Sucursal Destino" 
              value={branchId} 
              onChange={setBranchId} 
              options={[
                { value: "", label: "Seleccionar Sucursal" },
                ...branches.map(b => ({ value: String(b.id), label: b.nombre }))
              ]} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[var(--neutral-800)]/50">
            <Input 
              label="Fecha Esperada" 
              type="date" 
              value={estimatedArrival} 
              onChange={(e: any) => setEstimatedArrival(e.target.value)} 
            />
            <Select
              label="Términos (Días)"
              value={paymentDueDays}
              onChange={setPaymentDueDays}
              options={[
                { value: "0", label: "Contado (0 d)" },
                { value: "15", label: "Crédito (15 d)" },
                { value: "30", label: "Net 30" },
                { value: "60", label: "Net 60" },
                { value: "90", label: "Net 90" }
              ]}
            />
          </div>

          <div className="flex justify-between items-end pt-2">
            <span className="text-xs font-black text-[var(--neutral-400)] uppercase tracking-widest">Total Negociado</span>
            <span className="text-2xl font-black text-[var(--brand-400)] leading-none" style={{ textShadow: "0 0 20px var(--brand-glow)" }}>
              {formatCurrency(financialSummary)}
            </span>
          </div>
          
          <Button 
            className="w-full h-14 mt-4 font-black tracking-widest shadow-[0_10px_20px_rgba(217,99,79,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group border-none"
            style={{ backgroundImage: 'linear-gradient(45deg, var(--brand-600), var(--brand-400))' }}
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleSubmitOrder}
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
            {isSubmitting ? (
              <Spinner size={20} />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm">EMITIR ORDEN DE COMPRA</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
