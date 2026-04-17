"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import { History, Search } from "lucide-react";

import Spinner from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import SearchFilter from "@/components/ui/SearchFilter";

type InventoryMovement = components["schemas"]["InventoryMovement"];
type UserResponse = components["schemas"]["UserResponse"];

export default function AuditPage() {
  const { showToast } = useToast();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [branches, setBranches] = useState<Map<number, string>>(new Map());
  const [products, setProducts] = useState<Map<number, components["schemas"]["ProductResponse"]>>(new Map());
  const [suppliers, setSuppliers] = useState<Map<number, string>>(new Map());
  const [users, setUsers] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" | null }>({ key: "date", direction: "desc" });

  useEffect(() => {
    async function fetchData() {
      try {
        const [movs, bras, pros, sups, usrs] = await Promise.all([
          (apiClient as any).GET("/api/v1/inventory/movements"),
          apiClient.GET("/api/branches"),
          apiClient.GET("/api/catalog/products"),
          apiClient.GET("/api/catalog/suppliers"),
          apiClient.GET("/api/users"),
        ]);

        setMovements(movs.data ?? []);
        setBranches(new Map((bras.data ?? []).map((b) => [b.id!, b.nombre!])));
        setProducts(new Map((pros.data ?? []).map((p) => [p.id!, p])));
        setSuppliers(new Map((sups.data ?? []).map((s) => [s.id!, s.nombre!])));
        setUsers(new Map((usrs.data as UserResponse[] ?? []).map((u) => [u.id!, u.nombre!])));
      } catch (err) {
        showToast("Error al cargar datos de auditoría", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const filteredAndSortedMovements = movements.filter(m => {
    const product = products.get(m.productId!);
    const productName = (product?.nombre || "").toLowerCase();
    const userName = (users.get(m.userId!) || "").toLowerCase();
    const supplierName = product?.proveedorId ? (suppliers.get(product.proveedorId) || "").toLowerCase() : "";
    const reason = (m.reason || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return productName.includes(term) || userName.includes(term) || reason.includes(term) || supplierName.includes(term);
  }).sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    let valA: any = (a as any)[sortConfig.key];
    let valB: any = (b as any)[sortConfig.key];

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const columns: Column<InventoryMovement>[] = [
    {
      header: "Fecha",
      key: "date",
      width: "160px",
      sortable: true,
      render: (m) => (
        <span style={{ fontSize: "12px", color: "var(--neutral-400)" }}>
          {m.date ? new Date(m.date).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
        </span>
      )
    },
    {
      header: "Tipo",
      key: "type",
      width: "100px",
      sortable: true,
      render: (m) => (
        <Badge variant={m.type === "INGRESO" ? "success" : "danger"} dot>
          {m.type}
        </Badge>
      )
    },
    {
      header: "Motivo",
      key: "reason",
      sortable: true,
      render: (m) => {
        const product = products.get(m.productId!);
        const supplierName = product?.proveedorId ? suppliers.get(product.proveedorId) : null;
        return (
          <div className="flex flex-col">
            <span style={{ fontSize: "13px", color: "var(--neutral-300)" }}>{m.reason || "—"}</span>
            {m.reason === "COMPRA" && supplierName && (
              <span style={{ fontSize: "11px", color: "var(--brand-400)", fontWeight: 700 }}>{supplierName}</span>
            )}
          </div>
        );
      }
    },
    {
      header: "Producto",
      key: "productId",
      sortable: true,
      render: (m) => <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--neutral-100)" }}>{products.get(m.productId!)?.nombre || m.productId}</span>
    },
    {
      header: "Sucursal",
      key: "branchId",
      render: (m) => <span style={{ fontSize: "12px", color: "var(--neutral-400)" }}>{branches.get(m.branchId!) || m.branchId}</span>
    },
    {
      header: "Cantidad",
      key: "quantity",
      align: "right",
      width: "110px",
      sortable: true,
      render: (m) => (
        <span style={{ 
          fontSize: "14px", 
          fontWeight: 700, 
          color: m.type === "INGRESO" ? "var(--color-success)" : "var(--color-danger)",
          fontFamily: "monospace" 
        }}>
          {m.type === "INGRESO" ? "+" : "-"}{m.quantity}
        </span>
      )
    },
    {
      header: "Cantidad Final",
      key: "finalBalance",
      align: "right",
      width: "120px",
      sortable: true,
      render: (m) => (
        <span style={{ fontWeight: 800, color: "var(--neutral-100)", fontSize: "14px" }}>
          {m.finalBalance} 
          <small style={{ color: "var(--neutral-500)", marginLeft: "4px", fontWeight: 500, fontSize: "10px", textTransform: "uppercase" }}>
            {products.get(m.productId!)?.unitAbbreviation || "UND"}
          </small>
        </span>
      )
    },
    {
      header: "Responsable",
      key: "userId",
      render: (m) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--neutral-800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "var(--neutral-400)" }}>
            {(users.get(m.userId!)?.[0] || "U").toUpperCase()}
          </div>
          <span style={{ fontSize: "13px", color: "var(--neutral-300)" }}>{users.get(m.userId!) || m.userId}</span>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: "var(--page-padding)", maxWidth: "1400px", margin: "0 auto" }}>
      <PageHeader
        title="Auditoría Global"
        description="Seguimiento detallado de todos los movimientos de stock realizados en la red Zen Inventory."
      />

      <div style={{ 
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap",
        justifyContent: "space-between", 
        alignItems: "flex-end", 
        marginBottom: "32px", 
        gap: "24px" 
      }}>
        <div className="flex-1 max-w-md">
          <SearchFilter 
            placeholder="Buscar por producto, motivo o usuario..."
            value={searchTerm}
            onChange={setSearchTerm}
            containerClassName="w-full"
          />
        </div>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <DataTable<InventoryMovement>
          columns={columns}
          data={filteredAndSortedMovements}
          sortConfig={sortConfig}
          onSort={handleSort}
          isLoading={loading}
          emptyState={{
            title: "Sin movimientos",
            description: "No se han registrado movimientos de inventario en el sistema.",
            icon: <History size={40} />
          }}
        />
      </Card>
    </div>
  );
}
