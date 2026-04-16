"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import { getSession } from "@/api/auth";
import { useRouter } from "next/navigation";

type SupplierResponse = components["schemas"]["SupplierResponse"];

export default function MasterSuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierResponse | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    tiempoEntregaDias: 3,
  });

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
      const res = await apiClient.GET("/api/catalog/suppliers");
      setSuppliers(res.data ?? []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (supplier?: SupplierResponse) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        nombre: supplier.nombre ?? "",
        contacto: supplier.contacto ?? "",
        tiempoEntregaDias: supplier.tiempoEntregaDias ?? 3,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        nombre: "",
        contacto: "",
        tiempoEntregaDias: 3,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await apiClient.PUT("/api/catalog/suppliers/{id}", {
          params: { path: { id: editingSupplier.id! } },
          body: formData,
        });
      } else {
        await apiClient.POST("/api/catalog/suppliers", {
          body: formData,
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Error al guardar el proveedor.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return;
    try {
      await apiClient.DELETE("/api/catalog/suppliers/{id}", {
        params: { path: { id } },
      });
      fetchData();
    } catch (error) {
      alert("No se puede eliminar el proveedor. Probablemente tenga productos asociados.");
    }
  };

  if (loading) return <div style={{ padding: "40px", color: "var(--neutral-400)" }}>Cargando directorio de proveedores...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--neutral-50)", marginBottom: "8px" }}>
            Directorio de Proveedores
          </h1>
          <p style={{ color: "var(--neutral-400)", fontSize: "14px" }}>
            Gestiona los proveedores centralizados que surten a toda la red de sucursales.
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
          + Nuevo Proveedor
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {suppliers.map((s) => (
          <div key={s.id} style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-default)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--neutral-50)", marginBottom: "8px" }}>{s.nombre}</h3>
            <p style={{ fontSize: "14px", color: "var(--neutral-400)", marginBottom: "16px" }}>{s.contacto}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--border-default)" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-500)" }}>
                Entrega: <span style={{ color: "var(--brand-400)", fontWeight: 600 }}>{s.tiempoEntregaDias} días</span>
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleOpenModal(s)} style={{ background: "none", border: "none", color: "var(--brand-500)", cursor: "pointer", fontSize: "13px" }}>Editar</button>
                <button onClick={() => handleDelete(s.id!)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px" }}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "450px", border: "1px solid var(--border-default)" }}>
            <h2 style={{ marginBottom: "24px", color: "var(--neutral-50)" }}>{editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Nombre/Empresa</label>
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Contacto (Email/Tel/Dir)</label>
                <input
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Tiempo de Entrega Est. (Días)</label>
                <input
                  type="number"
                  value={formData.tiempoEntregaDias}
                  onChange={(e) => setFormData({ ...formData, tiempoEntregaDias: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  min={1}
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
