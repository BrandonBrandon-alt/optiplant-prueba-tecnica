"use client";

import React from "react";
import { Search, RefreshCcw } from "lucide-react";

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
      alignItems: "center", 
      justifyContent: "space-between",
      gap: "16px",
      background: "var(--bg-surface)"
    }}>
      
      {/* Search Input - Inventory Style */}
      <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
        <Search 
          size={16} 
          style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--neutral-500)" }} 
        />
        <input 
          type="text"
          placeholder="Filtrar por ID de venta, sucursal o cliente..."
          style={{ 
            width: "100%", 
            background: "var(--bg-base)", 
            border: "1px solid var(--border-default)", 
            borderRadius: "10px", 
            padding: "12px 16px 12px 48px", 
            fontSize: "14px", 
            color: "var(--neutral-200)",
            outline: "none",
            transition: "all 0.2s"
          }}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:border-brand-500"
        />
      </div>
      
      {/* Functional Controls */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button 
            onClick={onRefresh}
            style={{ 
                padding: "10px", 
                background: "var(--bg-base)", 
                border: "1px solid var(--border-default)", 
                borderRadius: "10px",
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
            background: "var(--bg-base)", 
            padding: "4px", 
            borderRadius: "10px", 
            border: "1px solid var(--border-default)" 
        }}>
            {['Todas', 'Anuladas'].map((label) => (
                <button 
                    key={label}
                    style={{ 
                        padding: "8px 16px", 
                        borderRadius: "8px", 
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
