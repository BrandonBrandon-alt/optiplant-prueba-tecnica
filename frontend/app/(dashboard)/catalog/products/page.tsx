"use client";

import { useEffect, useState, useTransition } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";
import { getSession } from "@/api/auth";
import { useRouter } from "next/navigation";
import { Package, Plus, Edit, Trash2, Search, Tag, Truck } from "lucide-react";

import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable, { Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";

// Types from schema
type ProductResponse = components["schemas"]["ProductResponse"];
type SupplierResponse = components["schemas"]["SupplierResponse"];
type UnitOfMeasureResponse = components["schemas"]["UnitOfMeasureResponse"];

export default function MasterProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [units, setUnits] = useState<UnitOfMeasureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    nombre: "",
    costoPromedio: 0,
    precioVenta: 0,
    proveedorId: 0,
    unitId: 0,
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
    setLoading(true);
    try {
      const [prodRes, suppRes, unitRes] = await Promise.all([
        apiClient.GET("/api/catalog/products"),
        apiClient.GET("/api/catalog/suppliers"),
        apiClient.GET("/api/catalog/units"),
      ]);
      setProducts(prodRes.data ?? []);
      setSuppliers(suppRes.data ?? []);
      setUnits(unitRes.data ?? []);
    } catch (error) {
      console.error("Error fetching master data:", error);
      showToast("Error al cargar los datos del catálogo.", "error");
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
        unitId: product.unitId ?? 0,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: "",
        nombre: "",
        costoPromedio: 0,
        precioVenta: 0,
        proveedorId: suppliers[0]?.id ?? 0,
        unitId: units[0]?.id ?? 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingProduct) {
          await apiClient.PUT("/api/catalog/products/{id}", {
            params: { path: { id: editingProduct.id! } },
            body: formData as any,
          });
          showToast("Producto actualizado correctamente.", "success", "Cambios guardados");
        } else {
          await apiClient.POST("/api/catalog/products", {
            body: formData as any,
          });
          showToast("Nuevo producto registrado en el catálogo.", "success", "Registro exitoso");
        }
        setShowModal(false);
        fetchData();
      } catch (error) {
        showToast("Error al guardar el producto. Verifica el SKU.", "error");
      }
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto del catálogo maestro?")) return;
    try {
      await apiClient.DELETE("/api/catalog/products/{id}", {
        params: { path: { id } },
      });
      showToast("El producto ha sido eliminado del catálogo.", "success");
      fetchData();
    } catch (error) {
      showToast("No se puede eliminar: tiene movimientos asociados.", "error");
    }
  };

  const columns: Column<ProductResponse>[] = [
    {
      header: "SKU",
      key: "sku",
      width: "120px",
      render: (p: ProductResponse) => <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 600, color: "var(--brand-400)" }}>{p.sku}</span>
    },
    {
      header: "Nombre",
      key: "nombre",
      render: (p: ProductResponse) => <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--neutral-100)" }}>{p.nombre}</span>
    },
    {
      header: "Unidad",
      key: "unitAbbreviation",
      width: "100px",
      render: (p: ProductResponse) => <Badge variant="neutral">{p.unitAbbreviation || "N/A"}</Badge>
    },
    {
      header: "Proveedor",
      key: "proveedorId",
      render: (p: ProductResponse) => (
        <span style={{ fontSize: "13px", color: "var(--neutral-400)" }}>
          {suppliers.find(s => s.id === p.proveedorId)?.nombre ?? "N/A"}
        </span>
      )
    },
    {
      header: "Precio Venta",
      key: "precioVenta",
      align: "right",
      render: (p: ProductResponse) => (
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--neutral-200)" }}>
          ${(p.precioVenta ?? 0).toLocaleString()}
        </span>
      )
    },
    {
      header: "Acciones",
      key: "actions",
      align: "right",
      width: "100px",
      render: (p: ProductResponse) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(p)} title="Editar producto">
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id!)} title="Eliminar producto">
            <span style={{ color: "var(--brand-500)" }}><Trash2 size={14} /></span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", gap: "16px", flexWrap: "wrap" }}>
        <PageHeader
          title="Catálogo Maestro"
          description="Gestiona los productos base que se replican en todas las sucursales del sistema."
        />
        <Button leftIcon={<Plus size={15} />} onClick={() => handleOpenModal()} style={{ marginTop: "4px" }}>
          Nuevo Producto
        </Button>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <DataTable<ProductResponse>
          columns={columns}
          data={products}
          isLoading={loading}
          emptyState={{
            title: "Catálogo vacío",
            description: "No hay productos registrados en el catálogo maestro.",
            icon: <Package size={40} />,
            action: (
              <Button size="sm" onClick={() => handleOpenModal()} leftIcon={<Plus size={13} />}>
                Crear primer producto
              </Button>
            )
          }}
        />
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        description="Define las características globales del producto."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} disabled={isPending}>Cancelar</Button>
            <Button size="sm" loading={isPending} onClick={handleSubmit as any}>Guardar Producto</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="SKU (Identificador Único)"
            value={formData.sku}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sku: e.target.value })}
            icon={<Tag size={15} />}
            placeholder="Ej. OPT-001"
            required
          />
          <Input
            label="Nombre del Producto"
            value={formData.nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
            icon={<Package size={15} />}
            placeholder="Ej. Gafas de Sol Clásicas"
            required
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input
              type="number"
              label="Costo Promedio"
              value={formData.costoPromedio.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, costoPromedio: Number(e.target.value) })}
              icon={<span style={{ fontSize: "12px", fontWeight: 700 }}>$</span>}
            />
            <Input
              type="number"
              label="Precio Venta"
              value={formData.precioVenta.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, precioVenta: Number(e.target.value) })}
              icon={<span style={{ fontSize: "12px", fontWeight: 700 }}>$</span>}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Select
              label="Unidad de Medida"
              value={formData.unitId.toString()}
              onChange={(val: string) => setFormData({ ...formData, unitId: Number(val) })}
              icon={<Search size={15} />}
              options={[
                { value: "0", label: "Selecciona unidad" },
                ...units.map(u => ({ value: u.id!.toString(), label: `${u.nombre} (${u.abreviatura})` }))
              ]}
            />
            <Select
              label="Proveedor"
              value={formData.proveedorId.toString()}
              onChange={(val: string) => setFormData({ ...formData, proveedorId: Number(val) })}
              icon={<Truck size={15} />}
              options={[
                { value: "0", label: "Selecciona proveedor" },
                ...suppliers.map(s => ({ value: s.id!.toString(), label: s.nombre! }))
              ]}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
