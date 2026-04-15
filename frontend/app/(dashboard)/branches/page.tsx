"use client";

import { useEffect, useState, useTransition } from "react";
import { apiClient } from "@/api/client";
import type { components } from "@/api/schema";

import Spinner    from "@/components/ui/Spinner";
import PageHeader from "@/components/ui/PageHeader";
import Card       from "@/components/ui/Card";
import Badge      from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Modal      from "@/components/ui/Modal";
import Button     from "@/components/ui/Button";
import Input      from "@/components/ui/Input";

// ── Types ──────────────────────────────────────────────────
type BranchResponse = components["schemas"]["BranchResponse"];
type BranchRequest  = components["schemas"]["BranchRequest"];

// ── Form state / validation ────────────────────────────────
type FormErrors = Partial<Record<keyof BranchRequest, string>>;

function validate(v: Partial<BranchRequest>): FormErrors {
  const e: FormErrors = {};
  if (!v.nombre?.trim())    e.nombre    = "El nombre es requerido.";
  if (!v.direccion?.trim()) e.direccion = "La dirección es requerida.";
  return e;
}

// ── Icons ──────────────────────────────────────────────────
const BuildingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

// ── BranchRow ──────────────────────────────────────────────
function BranchRow({ 
  branch, 
  onEdit, 
  onDelete 
}: { 
  branch: BranchResponse;
  onEdit: (b: BranchResponse) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <tr
      style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* ID */}
      <td style={{ padding: "13px 16px", width: "60px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--neutral-500)" }}>
          #{branch.id}
        </span>
      </td>
      {/* Nombre */}
      <td style={{ padding: "13px 16px" }}>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--neutral-100)", marginBottom: "2px" }}>
          {branch.nombre}
        </p>
        {branch.telefono && (
          <p style={{ fontSize: "12px", color: "var(--neutral-500)" }}>
            📞 {branch.telefono}
          </p>
        )}
      </td>
      {/* Dirección */}
      <td style={{ padding: "13px 16px" }}>
        <span style={{ fontSize: "13px", color: "var(--neutral-300)" }}>{branch.direccion}</span>
      </td>
      {/* Estado */}
      <td style={{ padding: "13px 16px" }}>
        <Badge variant={branch.activa ? "success" : "neutral"} dot>
          {branch.activa ? "Activa" : "Inactiva"}
        </Badge>
      </td>
      {/* Acciones */}
      <td style={{ padding: "13px 16px", textAlign: "right", width: "100px" }}>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(branch)} title="Editar sucursal">
            <EditIcon />
          </Button>
          {branch.activa && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(branch.id!)} title="Desactivar sucursal">
              <span style={{ color: "var(--brand-500)" }}><TrashIcon /></span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Create Modal Form ──────────────────────────────────────
function CreateBranchModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (b: BranchResponse) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues]   = useState<Partial<BranchRequest>>({ nombre: "", direccion: "", telefono: "" });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValues({ nombre: "", direccion: "", telefono: "" });
      setErrors({});
      setTouched({});
      setServerError(null);
    }
  }, [open]);

  const handleChange = (field: keyof BranchRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
    setServerError(null);
  };

  const handleBlur = (field: keyof BranchRequest) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nombre: true, direccion: true });
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    startTransition(async () => {
      const { data, error } = await apiClient.POST("/api/branches", {
        body: {
          nombre:    values.nombre!,
          direccion: values.direccion!,
          telefono:  values.telefono || undefined,
        },
      });

      if (error || !data) {
        setServerError("No se pudo crear la sucursal. Verifica tu sesión.");
        return;
      }
      onCreated(data);
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva sucursal"
      description="Completa los datos para registrar una sede en el sistema."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button size="sm" loading={isPending} onClick={handleSubmit as never}>
            Crear sucursal
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {serverError && (
          <div style={{ background: "rgba(217,99,79,0.08)", border: "1px solid rgba(217,99,79,0.25)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "13px", color: "var(--brand-500)" }}>
            {serverError}
          </div>
        )}
        <Input
          id="branch-nombre"
          label="Nombre de la sucursal"
          placeholder="Ej. Sede Central Bogotá"
          value={values.nombre ?? ""}
          onChange={handleChange("nombre")}
          onBlur={handleBlur("nombre")}
          error={touched.nombre ? errors.nombre : undefined}
          icon={<BuildingIcon />}
        />
        <Input
          id="branch-direccion"
          label="Dirección"
          placeholder="Ej. Carrera 15 # 45-20, Bogotá"
          value={values.direccion ?? ""}
          onChange={handleChange("direccion")}
          onBlur={handleBlur("direccion")}
          error={touched.direccion ? errors.direccion : undefined}
          icon={<MapPinIcon />}
        />
        <Input
          id="branch-telefono"
          label="Teléfono (opcional)"
          placeholder="Ej. 6015551234"
          value={values.telefono ?? ""}
          onChange={handleChange("telefono")}
          icon={<PhoneIcon />}
        />
      </form>
    </Modal>
  );
}

// ── Edit Modal Form ────────────────────────────────────────
function EditBranchModal({
  branch,
  open,
  onClose,
  onUpdated,
}: {
  branch: BranchResponse | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (b: BranchResponse) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues]   = useState<Partial<BranchRequest>>({ nombre: "", direccion: "", telefono: "" });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (branch) {
      setValues({
        nombre:    branch.nombre,
        direccion: branch.direccion,
        telefono:  branch.telefono || "",
      });
      setErrors({});
      setTouched({});
      setServerError(null);
    }
  }, [branch, open]);

  const handleChange = (field: keyof BranchRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
    setServerError(null);
  };

  const handleBlur = (field: keyof BranchRequest) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch?.id) return;

    setTouched({ nombre: true, direccion: true });
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    startTransition(async () => {
      const { data, error } = await apiClient.PUT("/api/branches/{id}", {
        params: { path: { id: branch.id! } },
        body: {
          nombre:    values.nombre!,
          direccion: values.direccion!,
          telefono:  values.telefono || undefined,
        },
      });

      if (error || !data) {
        setServerError("No se pudo actualizar la sucursal.");
        return;
      }
      onUpdated(data);
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar sucursal"
      description="Actualiza la información de la sede seleccionada."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button size="sm" loading={isPending} onClick={handleSubmit as never}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {serverError && (
          <div style={{ background: "rgba(217,99,79,0.08)", border: "1px solid rgba(217,99,79,0.25)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "13px", color: "var(--brand-500)" }}>
            {serverError}
          </div>
        )}
        <Input
          id="edit-branch-nombre"
          label="Nombre"
          value={values.nombre ?? ""}
          onChange={handleChange("nombre")}
          onBlur={handleBlur("nombre")}
          error={touched.nombre ? errors.nombre : undefined}
          icon={<BuildingIcon />}
        />
        <Input
          id="edit-branch-direccion"
          label="Dirección"
          value={values.direccion ?? ""}
          onChange={handleChange("direccion")}
          onBlur={handleBlur("direccion")}
          error={touched.direccion ? errors.direccion : undefined}
          icon={<MapPinIcon />}
        />
        <Input
          id="edit-branch-telefono"
          label="Teléfono"
          value={values.telefono ?? ""}
          onChange={handleChange("telefono")}
          icon={<PhoneIcon />}
        />
      </form>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function BranchesPage() {
  const [branches, setBranches]   = useState<BranchResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBranch, setEditingBranch]     = useState<BranchResponse | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    apiClient.GET("/api/branches").then(({ data }) => {
      setBranches(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleCreated = (newBranch: BranchResponse) => {
    setBranches((prev) => [...prev, newBranch]);
  };

  const handleUpdated = (updated: BranchResponse) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Estás seguro de que deseas desactivar esta sucursal? No podrá ser usada para ventas o inventario mientras esté inactiva.")) return;

    startTransition(async () => {
      const { error } = await apiClient.DELETE("/api/branches/{id}", {
        params: { path: { id } },
      });

      if (!error) {
        setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, activa: false } : b)));
      } else {
        alert("Error al desactivar la sucursal.");
      }
    });
  };

  const active   = branches.filter((b) => b.activa).length;
  const inactive = branches.filter((b) => !b.activa).length;

  if (loading) return <Spinner fullPage />;

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1100px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", gap: "16px", flexWrap: "wrap" }}>
        <PageHeader
          title="Sucursales"
          description={
            <>
              Administra las{" "}
              <em style={{ color: "var(--brand-500)", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
                sedes
              </em>{" "}
              de OptiPlant en toda la red.
            </>
          }
        />
        <Button
          leftIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
          onClick={() => setShowCreateModal(true)}
          style={{ marginTop: "4px", flexShrink: 0 }}
        >
          Nueva sucursal
        </Button>
      </div>

      {/* Summary badges */}
      {branches.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", animation: "fadeInUp 0.35s ease 0.05s both" }}>
          <Badge variant="neutral">{branches.length} sedes totales</Badge>
          {active   > 0 && <Badge variant="success">{active} activas</Badge>}
          {inactive > 0 && <Badge variant="warning">{inactive} inactivas</Badge>}
        </div>
      )}

      {/* Table Card */}
      <Card delay="0.1s" style={{ padding: 0, overflow: "hidden" }}>
        {branches.length === 0 ? (
          <EmptyState
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            }
            title="No hay sucursales registradas"
            description="Crea la primera sede para comenzar a gestionar el inventario."
            action={
              <Button size="sm" onClick={() => setShowCreateModal(true)}
                leftIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
              >
                Crear primera sucursal
              </Button>
            }
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                  {["#", "Nombre / Teléfono", "Dirección", "Estado", "Acciones"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--neutral-500)",
                        textAlign: h === "Acciones" ? "right" : "left",
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        background: "var(--bg-surface)",
                        width: i === 0 ? "60px" : h === "Acciones" ? "100px" : undefined,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <BranchRow 
                    key={branch.id} 
                    branch={branch} 
                    onEdit={setEditingBranch}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {branches.length > 0 && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--neutral-600)" }}>
              {branches.length} {branches.length === 1 ? "sucursal registrada" : "sucursales registradas"} en el sistema
            </span>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <CreateBranchModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />

      {/* Edit Modal */}
      <EditBranchModal
        branch={editingBranch}
        open={editingBranch !== null}
        onClose={() => setEditingBranch(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
