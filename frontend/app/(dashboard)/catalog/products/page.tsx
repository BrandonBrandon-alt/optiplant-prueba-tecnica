"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import { getSession } from "@/api/auth";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";

// Types from schema
type ProductResponse = components["schemas"]["ProductResponse"];
type SupplierResponse = components["schemas"]["SupplierResponse"];

export default function MasterProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    nombre: "",
    costoPromedio: 0,
    precioVenta: 0,
    proveedorId: 0,
    unit: "UNIDADES",
  });
  const { showToast } = useToast();

  useEffect(() => {
    const session = getSession();
    if (!session || session.rol !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [router]);

  async function fetchData() {
    try {
      const [prodRes, suppRes] = await Promise.all([
        apiClient.GET("/api/catalog/products"),
        apiClient.GET("/api/catalog/suppliers"),
      ]);
      setProducts(prodRes.data ?? []);
      setSuppliers(suppRes.data ?? []);
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (product?: ProductResponse) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku ?? "",
        nombre: product.nombre ?? "",
        costoPromedio: product.costoPromedio ?? 0,
        precioVenta: product.precioVenta ?? 0,
        proveedorId: product.proveedorId ?? 0,
        unit: (product as any).unit || "UNIDADES",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: "",
        nombre: "",
        costoPromedio: 0,
        precioVenta: 0,
        proveedorId: suppliers[0]?.id ?? 0,
        unit: "UNIDADES",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiClient.PUT("/api/catalog/products/{id}", {
          params: { path: { id: editingProduct.id! } },
          body: formData,
        });
      } else {
        await apiClient.POST("/api/catalog/products", {
          body: formData,
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Error al guardar el producto. Verifica que el SKU sea único y los campos requeridos.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto del catálogo maestro?")) return;
    try {
      await apiClient.DELETE("/api/catalog/products/{id}", {
        params: { path: { id } },
      });
      fetchData();
    } catch (error) {
      alert("No se puede eliminar el producto porque tiene movimientos o existencias vinculadas.");
    }
  };

  if (loading) return <div style={{ padding: "40px", color: "var(--neutral-400)" }}>Cargando catálogo maestro...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--neutral-50)", marginBottom: "8px" }}>
            Catálogo Maestro de Productos
          </h1>
          <p style={{ color: "var(--neutral-400)", fontSize: "14px" }}>
            Gestiona los productos base que se replican en todas las sucursales.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            background: "var(--brand-500)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Nuevo Producto
        </button>
      </header>

      <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-default)" }}>
               <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>SKU</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Nombre</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Unidad</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Proveedor</th>
              <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Precio Venta</th>
              <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                <td style={{ padding: "16px 24px", fontSize: "14px", color: "var(--brand-400)", fontWeight: 600 }}>{p.sku}</td>
                 <td style={{ padding: "16px 24px", fontSize: "14px", color: "var(--neutral-100)" }}>{p.nombre}</td>
                <td style={{ padding: "16px 24px", fontSize: "12px", color: "var(--neutral-500)" }}>
                    <Badge variant="neutral">{(p as any).unit || "UNIDADES"}</Badge>
                </td>
                <td style={{ padding: "16px 24px", fontSize: "14px", color: "var(--neutral-400)" }}>
                  {suppliers.find(s => s.id === p.proveedorId)?.nombre ?? "N/A"}
                </td>
                <td style={{ padding: "16px 24px", fontSize: "14px", color: "var(--neutral-200)", textAlign: "right" }}>
                  ${(p.precioVenta ?? 0).toLocaleString()}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <button onClick={() => handleOpenModal(p)} style={{ background: "none", border: "none", color: "var(--brand-500)", cursor: "pointer", marginRight: "12px" }}>Editar</button>
                  <button onClick={() => handleDelete(p.id!)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "500px", border: "1px solid var(--border-default)" }}>
            <h2 style={{ marginBottom: "24px", color: "var(--neutral-50)" }}>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>SKU (Único)</label>
                <input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Nombre</label>
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Costo Promedio</label>
                  <input
                    type="number"
                    value={formData.costoPromedio}
                    onChange={(e) => setFormData({ ...formData, costoPromedio: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Precio Venta</label>
                  <input
                    type="number"
                    value={formData.precioVenta}
                    onChange={(e) => setFormData({ ...formData, precioVenta: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  />
                </div>
              </div>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <Select
                  label="Unidad de Medida"
                  value={formData.unit}
                  onChange={(val) => setFormData({ ...formData, unit: val })}
                  options={[
                    { value: "KILOS", label: "Kilogramos (Kg)" },
                    { value: "LITROS", label: "Litros (L)" },
                    { value: "UNIDADES", label: "Unidades (Und)" },
                    { value: "METROS_CUADRADOS", label: "Metros Cuadrados (M2)" },
                  ]}
                />
                <Select
                  label="Proveedor"
                  value={formData.proveedorId.toString()}
                  onChange={(val) => setFormData({ ...formData, proveedorId: Number(val) })}
                  options={[
                    { value: "0", label: "Selecciona proveedor" },
                    ...suppliers.map(s => ({ value: s.id!.toString(), label: s.nombre! }))
                  ]}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: "none", border: "1px solid var(--border-default)", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" style={{ background: "var(--brand-500)", border: "none", color: "white", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
