"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import { getSession } from "@/api/auth";
import { useRouter } from "next/navigation";

type UnitOfMeasureResponse = components["schemas"]["UnitOfMeasureResponse"];

export default function MasterUnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<UnitOfMeasureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasureResponse | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    abreviatura: "",
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
      const res = await apiClient.GET("/api/catalog/units");
      setUnits(res.data ?? []);
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (unit?: UnitOfMeasureResponse) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        nombre: unit.nombre ?? "",
        abreviatura: unit.abreviatura ?? "",
      });
    } else {
      setEditingUnit(null);
      setFormData({
        nombre: "",
        abreviatura: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await apiClient.PUT("/api/catalog/units/{id}", {
          params: { path: { id: editingUnit.id! } },
          body: formData,
        });
      } else {
        await apiClient.POST("/api/catalog/units", {
          body: formData,
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Error al guardar la unidad de medida.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta unidad de medida?")) return;
    try {
      await apiClient.DELETE("/api/catalog/units/{id}", {
        params: { path: { id } },
      });
      fetchData();
    } catch (error) {
      alert("No se puede eliminar la unidad. Podría estar en uso por algún producto.");
    }
  };

  if (loading) return <div style={{ padding: "40px", color: "var(--neutral-400)" }}>Cargando catálogo de unidades...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--neutral-50)", marginBottom: "8px" }}>
            Unidades de Medida
          </h1>
          <p style={{ color: "var(--neutral-400)", fontSize: "14px" }}>
            Estandariza las unidades (Kg, Unidades, Litros) válidas en todo el sistema.
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
          + Nueva Unidad
        </button>
      </header>

      <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-default)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Nombre</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Abreviatura</th>
              <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", color: "var(--neutral-500)", textTransform: "uppercase" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                <td style={{ padding: "16px 24px", fontSize: "14px", color: "var(--neutral-100)", fontWeight: 500 }}>{u.nombre}</td>
                <td style={{ padding: "16px 24px", fontSize: "14px", color: "var(--brand-400)", fontWeight: 700 }}>{u.abreviatura}</td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <button onClick={() => handleOpenModal(u)} style={{ background: "none", border: "none", color: "var(--brand-500)", cursor: "pointer", marginRight: "12px" }}>Editar</button>
                  <button onClick={() => handleDelete(u.id!)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "400px", border: "1px solid var(--border-default)" }}>
            <h2 style={{ marginBottom: "24px", color: "var(--neutral-50)" }}>{editingUnit ? "Editar Unidad" : "Nueva Unidad"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Nombre Completo</label>
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Kilogramos"
                  style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "var(--neutral-400)" }}>Abreviatura</label>
                <input
                  value={formData.abreviatura}
                  onChange={(e) => setFormData({ ...formData, abreviatura: e.target.value })}
                  placeholder="Ej: Kg"
                  style={{ width: "100%", padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "white" }}
                  required
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
