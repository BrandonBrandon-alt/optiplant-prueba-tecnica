"use client";

import { useEffect, useState, useTransition } from "react";
import { apiClient } from "@/api/client";
import { useToast } from "@/context/ToastContext";
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
type UserResponse   = components["schemas"]["UserResponse"];
type UserRequest    = components["schemas"]["UserRequest"];
type RoleResponse   = components["schemas"]["RoleResponse"];
type BranchResponse = components["schemas"]["BranchResponse"];

// ── Icons ──────────────────────────────────────────────────
const UserIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);
const MailIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
    </svg>
);
const LockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const ShieldIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const BuildingIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
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

// ── UserRow Component ──────────────────────────────────────
function UserRow({ user, branches, onEdit, onDeactivate }: { 
    user: UserResponse; 
    branches: BranchResponse[];
    onEdit: (u: UserResponse) => void; 
    onDeactivate: (id: number) => void;
}) {
    const branchName = user.sucursalId 
        ? branches.find(b => b.id === user.sucursalId)?.nombre || `Sucursal #${user.sucursalId}`
        : "Acceso Global";

    return (
        <tr
            style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
            <td style={{ padding: "13px 16px", width: "60px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--neutral-500)" }}>#{user.id}</span>
            </td>
            <td style={{ padding: "13px 16px" }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--neutral-100)", marginBottom: "2px" }}>{user.nombre}</p>
                <p style={{ fontSize: "12px", color: "var(--neutral-500)" }}>{user.email}</p>
            </td>
            <td style={{ padding: "13px 16px" }}>
                <Badge variant="neutral">{user.role?.nombre}</Badge>
            </td>
            <td style={{ padding: "13px 16px" }}>
                <span style={{ fontSize: "13px", color: "var(--neutral-300)" }}>{branchName}</span>
            </td>
            <td style={{ padding: "13px 16px" }}>
                <Badge variant={user.activo ? "success" : "neutral"} dot>
                    {user.activo ? "Activo" : "Inactivo"}
                </Badge>
            </td>
            <td style={{ padding: "13px 16px", textAlign: "right", width: "100px" }}>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)} title="Editar usuario">
                        <EditIcon />
                    </Button>
                    {user.activo && (
                        <Button variant="ghost" size="sm" onClick={() => onDeactivate(user.id!)} title="Desactivar usuario">
                            <span style={{ color: "var(--brand-500)" }}><TrashIcon /></span>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ── CreateUserModal ────────────────────────────────────────
function CreateUserModal({ open, onClose, roles, branches, onCreated }: {
    open: boolean;
    onClose: () => void;
    roles: RoleResponse[];
    branches: BranchResponse[];
    onCreated: (u: UserResponse) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [values, setValues] = useState<Partial<UserRequest>>({ rolId: 0, activo: true });
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setValues({ rolId: roles[0]?.id || 0, activo: true, nombre: "", email: "", password: "" });
            setServerError(null);
        }
    }, [open, roles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!values.rolId) return;

        startTransition(async () => {
            const { data, error } = await apiClient.POST("/api/users", {
                body: {
                    nombre: values.nombre!,
                    email: values.email!,
                    password: values.password!,
                    rolId: Number(values.rolId),
                    sucursalId: values.rolId !== 1 ? Number(values.sucursalId) : undefined, // Solo si no es ADMIN
                } as any
            });

            if (data) {
                showToast("Usuario creado correctamente.", "success", "Registro exitoso");
                onCreated(data);
                onClose();
            } else {
                showToast(error?.message || "No se pudo crear el usuario.", "error", "Error");
                setServerError(error?.message || "Error al crear usuario.");
            }
        });
    };

    const { showToast } = useToast();


    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Nuevo Usuario"
            description="Registra un nuevo colaborador y asigna sus permisos."
            footer={
                <>
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button size="sm" loading={isPending} onClick={handleSubmit as any}>Crear Usuario</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {serverError && <div style={{ color: "var(--brand-500)", fontSize: "13px" }}>{serverError}</div>}
                <Input
                    label="Nombre completo"
                    value={values.nombre ?? ""}
                    onChange={e => setValues({...values, nombre: e.target.value})}
                    icon={<UserIcon />}
                    placeholder="Ej. Juan Pérez"
                />
                <Input
                    label="Email"
                    value={values.email ?? ""}
                    onChange={e => setValues({...values, email: e.target.value})}
                    icon={<MailIcon />}
                    placeholder="juan@optiplant.com"
                />
                <Input
                    label="Contraseña"
                    type="password"
                    value={values.password ?? ""}
                    onChange={e => setValues({...values, password: e.target.value})}
                    icon={<LockIcon />}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--neutral-400)" }}>Rol del sistema</label>
                    <select
                        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "10px", color: "white" }}
                        value={values.rolId}
                        onChange={e => setValues({...values, rolId: Number(e.target.value)})}
                    >
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                </div>
                {values.rolId !== 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--neutral-400)" }}>Sucursal asignada</label>
                        <select
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "10px", color: "white" }}
                            value={values.sucursalId || ""}
                            onChange={e => setValues({...values, sucursalId: Number(e.target.value)})}
                        >
                            <option value="">Seleccionar sede...</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                        </select>
                    </div>
                )}
            </form>
        </Modal>
    );
}

// ── EditUserModal ──────────────────────────────────────────
function EditUserModal({ open, onClose, user, roles, branches, onUpdated }: {
    open: boolean;
    onClose: () => void;
    user: UserResponse | null;
    roles: RoleResponse[];
    branches: BranchResponse[];
    onUpdated: (u: UserResponse) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [values, setValues] = useState<Partial<UserRequest>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setValues({
                nombre: user.nombre,
                email: user.email,
                rolId: user.role?.id,
                sucursalId: user.sucursalId || undefined,
                activo: user.activo,
                password: ""
            });
            setServerError(null);
        }
    }, [user, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        startTransition(async () => {
            const { data, error } = await apiClient.PUT("/api/users/{id}", {
                params: { path: { id: user.id! } },
                body: {
                    nombre: values.nombre!,
                    email: values.email!,
                    password: values.password || undefined,
                    rolId: Number(values.rolId),
                    sucursalId: values.rolId !== 1 ? Number(values.sucursalId) : undefined,
                    activo: values.activo
                } as any
            });

            if (data) {
                showToast("Los cambios se han guardado correctamente.", "success", "Usuario actualizado");
                onUpdated(data);
                onClose();
            } else {
                showToast(error?.message || "No se pudo actualizar el usuario.", "error", "Error");
                setServerError(error?.message || "Error al actualizar usuario.");
            }
        });
    };

    const { showToast } = useToast();


    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Editar Usuario"
            description="Modifica los datos del usuario seleccionado."
            footer={
                <>
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button size="sm" loading={isPending} onClick={handleSubmit as any}>Guardar Cambios</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {serverError && <div style={{ color: "var(--brand-500)", fontSize: "13px" }}>{serverError}</div>}
                <Input
                    label="Nombre completo"
                    value={values.nombre ?? ""}
                    onChange={e => setValues({...values, nombre: e.target.value})}
                    icon={<UserIcon />}
                />
                <Input
                    label="Email"
                    value={values.email ?? ""}
                    onChange={e => setValues({...values, email: e.target.value})}
                    icon={<MailIcon />}
                />
                <Input
                    label="Nueva contraseña (dejar en blanco para no cambiar)"
                    type="password"
                    value={values.password ?? ""}
                    onChange={e => setValues({...values, password: e.target.value})}
                    icon={<LockIcon />}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--neutral-400)" }}>Rol del sistema</label>
                    <select
                        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "10px", color: "white" }}
                        value={values.rolId}
                        onChange={e => setValues({...values, rolId: Number(e.target.value)})}
                    >
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                </div>
                {values.rolId !== 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--neutral-400)" }}>Sucursal asignada</label>
                        <select
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "10px", color: "white" }}
                            value={values.sucursalId || ""}
                            onChange={e => setValues({...values, sucursalId: Number(e.target.value)})}
                        >
                            <option value="">Seleccionar sede...</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                        </select>
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                   <input 
                      type="checkbox" 
                      checked={values.activo} 
                      onChange={e => setValues({...values, activo: e.target.checked})} 
                    />
                   <span style={{ fontSize: "14px" }}>Cuenta activa</span>
                </div>
            </form>
        </Modal>
    );
}

// ── Main Page ──────────────────────────────────────────────
export default function UsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

    const [, startTransition] = useTransition();

    useEffect(() => {
        Promise.all([
            apiClient.GET("/api/users"),
            apiClient.GET("/api/roles"),
            apiClient.GET("/api/branches")
        ]).then(([uRes, rRes, bRes]) => {
            setUsers(uRes.data || []);
            setRoles(rRes.data || []);
            setBranches(bRes.data || []);
            setLoading(false);
        });
    }, []);

    const handleCreated = (u: UserResponse) => {
        setUsers(prev => [...prev, u]);
    };

    const handleUpdated = (u: UserResponse) => {
        setUsers(prev => prev.map(item => item.id === u.id ? u : item));
    };

    const handleDeactivate = (id: number) => {
        if (!confirm("¿Desactivar este usuario? Ya no podrá acceder al sistema.")) return;
        startTransition(async () => {
             const { error } = await apiClient.DELETE("/api/users/{id}", { params: { path: { id } } });
             if (!error) {
                 showToast("El usuario ha sido desactivado.", "success", "Usuario desactivado");
                 setUsers(prev => prev.map(u => u.id === id ? { ...u, activo: false } : u));
             } else {
                 showToast("Error al intentar desactivar el usuario.", "error");
             }
        });
    };

    const { showToast } = useToast();


    if (loading) return <Spinner fullPage />;

    return (
        <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", gap: "16px", flexWrap: "wrap" }}>
                <PageHeader 
                    title="Usuarios y Permisos" 
                    description="Administra los accesos de tus colaboradores y sus roles en las sucursales."
                />
                <Button onClick={() => setShowCreate(true)} style={{ marginTop: "4px" }}>Nuevo Usuario</Button>
            </div>

            <Card style={{ padding: 0, overflow: "hidden" }}>
                {users.length === 0 ? (
                    <EmptyState 
                        icon={<UserIcon />}
                        title="Sin usuarios" 
                        description="No hay otros usuarios registrados." 
                    />
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                                    {["ID", "Nombre / Email", "Rol", "Sede", "Estado", "Acciones"].map((h) => (
                                        <th key={h} style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--neutral-500)", textAlign: h === "Acciones" ? "right" : "left", textTransform: "uppercase" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => <UserRow key={u.id} user={u} branches={branches} onEdit={setEditingUser} onDeactivate={handleDeactivate} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <CreateUserModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                roles={roles}
                branches={branches}
                onCreated={handleCreated}
            />

            <EditUserModal
                open={editingUser !== null}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                roles={roles}
                branches={branches}
                onUpdated={handleUpdated}
            />
        </div>
    );
}
