"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Plus, Eye } from "lucide-react";

interface InventoryItem {
  id: number;
  productId: number;
  productoNombre: string;
  sku: string;
  stockActual: number;
  precioVenta: number;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  onClick: (item: InventoryItem) => void;
  mode?: "add" | "view";
}

export default function InventoryItemCard({ item, onClick, mode = "add" }: InventoryItemCardProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

  return (
    <Card 
      onClick={() => onClick(item)}
      className={`p-5 cursor-pointer transition-all border-neutral-800 bg-neutral-900 hover:border-brand-500 hover:shadow-[0_0_20px_rgba(235,108,31,0.15)] group relative overflow-hidden ${item.stockActual <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
    >
      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-brand-500 text-white p-1 rounded-bl-lg shadow-lg">
          {mode === "add" ? <Plus className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </div>
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <Badge variant={item.stockActual > 10 ? "success" : "warning"}>
          {item.stockActual} en stock
        </Badge>
        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">{item.sku}</span>
      </div>
      
      <h3 className="font-bold text-neutral-100 group-hover:text-brand-400 transition-colors line-clamp-2 min-h-[3rem] text-lg uppercase tracking-tight">
        {item.productoNombre}
      </h3>
      
      <div className="mt-6 flex items-baseline justify-between">
        <div>
            <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter">Precio de Venta</p>
            <span className="text-xl font-black text-white">
              {formatCurrency(item.precioVenta)}
            </span>
        </div>
      </div>
    </Card>
  );
}
