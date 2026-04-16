"use client";

import React from "react";
import { Search, RefreshCcw } from "lucide-react";
import Input from "@/components/ui/Input";

interface HistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export default function HistoryFilters({ searchTerm, onSearchChange, onRefresh }: HistoryFiltersProps) {
  return (
    <div style={{ 
      padding: "20px 24px", 
      borderBottom: "1px solid var(--border-default)", 
      display: "flex", 
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-end", // Align with bottom of inputs
      justifyContent: "space-between",
      gap: "16px",
      background: "var(--bg-surface)"
    }}>
      
      {/* Search Input - Using custom UI Component */}
      <div style={{ width: "100%", maxWidth: "450px" }}>
        <Input 
          label="Búsqueda de Auditoría"
          placeholder="ID venta, sucursal o cliente..."
          icon={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Functional Controls */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", paddingBottom: "2px" }}>
        <button 
            onClick={onRefresh}
            style={{ 
                padding: "11px", 
                background: "var(--bg-card)", 
                border: "1px solid var(--border-default)", 
                borderRadius: "var(--radius-md)",
                color: "var(--neutral-500)",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
            title="Sincronizar Datos"
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--neutral-200)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--neutral-500)"}
        >
            <RefreshCcw size={16} />
        </button>

        <div style={{ 
            display: "flex", 
            background: "var(--bg-card)", 
            padding: "4px", 
            borderRadius: "var(--radius-md)", 
            border: "1px solid var(--border-default)" 
        }}>
            {['Todas', 'Anuladas'].map((label) => (
                <button 
                    key={label}
                    style={{ 
                        padding: "8px 16px", 
                        borderRadius: "6px", 
                        border: "none", 
                        cursor: "pointer", 
                        fontSize: "12px", 
                        fontWeight: 600,
                        background: label === 'Todas' ? "var(--brand-500)" : "transparent",
                        color: label === 'Todas' ? "white" : "var(--neutral-500)",
                        transition: "all 0.2s"
                    }}
                >
                    {label}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
