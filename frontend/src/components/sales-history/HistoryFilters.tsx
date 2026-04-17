import React from "react";
import SearchFilter from "@/components/ui/SearchFilter";
import Separator from "@/components/ui/Separator";

interface HistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function HistoryFilters({ searchTerm, onSearchChange }: HistoryFiltersProps) {
  return (
    <div className="p-6 flex flex-row flex-wrap items-end justify-between gap-6 bg-[var(--bg-surface)]">
      <Separator />
      
      <SearchFilter 
        label="Búsqueda de Auditoría"
        placeholder="ID venta, sucursal o cliente..."
        value={searchTerm}
        onChange={onSearchChange}
        containerClassName="w-full max-w-[450px]"
        className="h-11 shadow-sm"
      />
    </div>
  );
}
