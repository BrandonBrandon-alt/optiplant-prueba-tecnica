"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";

import Spinner    from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import Card       from "@/components/ui/Card";
import Badge      from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

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
}: {
  product: ProductResponse;
  inventory: LocalInventory | undefined;
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
      {/* SKU */}
      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--neutral-500)", background: "var(--bg-hover)", padding: "2px 7px", borderRadius: "5px", border: "1px solid var(--border-subtle)" }}>
          {product.sku}
        </span>
      </td>
      {/* Producto */}
      <td style={{ padding: "13px 16px" }}>
        <span style={{ fontSize: "14px", color: "var(--neutral-100)", fontWeight: 500 }}>
          {product.nombre}
        </span>
      </td>
      {/* Stock actual */}
      <td style={{ padding: "13px 16px", textAlign: "right" }}>
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
          {inventory ? current : "—"}
        </span>
      </td>
      {/* Stock mínimo */}
      <td style={{ padding: "13px 16px", textAlign: "right" }}>
        <span style={{ fontSize: "13px", color: "var(--neutral-500)", fontFamily: "monospace" }}>
          {inventory ? minimum : "—"}
        </span>
      </td>
      {/* Estado */}
      <td style={{ padding: "13px 16px" }}>
        {inventory ? (
          <StockBadge current={current} minimum={minimum} />
        ) : (
          <Badge variant="neutral">Sin datos</Badge>
        )}
      </td>
      {/* Última actualización */}
      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: "12px", color: "var(--neutral-500)" }}>
          {inventory?.lastUpdated
            ? new Date(inventory.lastUpdated).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
            : "—"}
        </span>
      </td>
    </tr>
  );
}

// ── Select ─────────────────────────────────────────────────
function BranchSelect({
  branches,
  selected,
  onChange,
}: {
  branches: BranchResponse[];
  selected: number | null;
  onChange: (id: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <select
        value={selected ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "8px 12px",
          fontSize: "13.5px",
          color: "var(--neutral-100)",
          outline: "none",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          minWidth: "220px",
        }}
      >
        <option value="" disabled>Selecciona una sucursal…</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>{b.nombre}</option>
        ))}
      </select>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function InventoryPage() {
  const [branches, setBranches]         = useState<BranchResponse[]>([]);
  const [products, setProducts]         = useState<ProductResponse[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Map<number, LocalInventory>>(new Map());
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loadingInit, setLoadingInit]   = useState(true);
  const [loadingInv, setLoadingInv]     = useState(false);

  // Initial load: branches + products
  useEffect(() => {
    async function init() {
      try {
        const [bra, pro] = await Promise.all([
          apiClient.GET("/api/branches"),
          apiClient.GET("/api/catalog/products"),
        ]);
        const branchList = bra.data ?? [];
        setBranches(branchList);
        setProducts(pro.data ?? []);
        if (branchList.length > 0) {
          setSelectedBranch(branchList[0].id ?? null);
        }
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, []);

  // Load inventory when branch changes
  useEffect(() => {
    if (!selectedBranch || products.length === 0) return;

    setLoadingInv(true);
    const map = new Map<number, LocalInventory>();

    Promise.all(
      products.map((p) =>
        apiClient
          .GET("/api/v1/inventory/branches/{branchId}/products/{productId}", {
            params: { path: { branchId: selectedBranch, productId: p.id! } },
          })
          .then((r) => {
            if (r.data) map.set(p.id!, r.data);
          })
          .catch(() => {/* producto sin inventario en esa sucursal */})
      )
    ).finally(() => {
      setInventoryMap(new Map(map));
      setLoadingInv(false);
    });
  }, [selectedBranch, products]);

  if (loadingInit) return <Spinner fullPage />;

  const currentBranch = branches.find((b) => b.id === selectedBranch);
  const withStock  = products.filter((p) => (inventoryMap.get(p.id!)?.currentQuantity ?? 0) > 0).length;
  const critical   = products.filter((p) => {
    const inv = inventoryMap.get(p.id!);
    return inv && inv.currentQuantity! <= inv.minimumStock!;
  }).length;

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1100px" }}>
      <PageHeader
        title="Inventario"
        description={
          <>
            Stock en tiempo real por sucursal.{" "}
            <em style={{ color: "var(--brand-500)", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
              Selecciona una sede
            </em>{" "}
            para ver su estado.
          </>
        }
      />

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
          animation: "fadeInUp 0.35s ease 0.05s both",
        }}
      >
        <BranchSelect
          branches={branches}
          selected={selectedBranch}
          onChange={setSelectedBranch}
        />
        {!loadingInv && selectedBranch && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Badge variant="neutral">{products.length} productos</Badge>
            <Badge variant="success">{withStock} con stock</Badge>
            {critical > 0 && <Badge variant="warning">{critical} críticos</Badge>}
          </div>
        )}
      </div>

      {/* Table */}
      <Card delay="0.1s" style={{ padding: 0, overflow: "hidden" }}>
        {loadingInv ? (
          <div style={{ padding: "48px 0" }}>
            <Spinner fullPage />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            }
            title="No hay productos en el catálogo"
            description="Crea productos en el catálogo para ver su inventario aquí."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                  {["SKU", "Producto", "Stock actual", "Mínimo", "Estado", "Actualizado"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--neutral-500)",
                        textAlign: i >= 2 && i <= 3 ? "right" : "left",
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        background: "var(--bg-surface)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <InventoryRow
                    key={product.id}
                    product={product}
                    inventory={inventoryMap.get(product.id!)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {!loadingInv && currentBranch && products.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--neutral-600)" }}>
              {currentBranch.nombre} · {currentBranch.direccion}
            </span>
            <span style={{ fontSize: "11px", color: "var(--neutral-600)" }}>
              {products.length} productos en catálogo
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
