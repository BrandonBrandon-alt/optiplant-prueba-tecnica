import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout, getSession, type AuthSession } from "@/api/auth";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/inventory",
    label: "Inventario",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    href: "/alerts",
    label: "Alertas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

const adminItems = [
  {
    href: "/branches",
    label: "Sucursales",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/users",
    label: "Usuarios",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Análisis Global",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    href: "/transfers/monitor",
    label: "Monitor Logístico",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

const masterItems = [
  {
    href: "/catalog/products",
    label: "Catálogo Productos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 8V21H3V8" />
        <path d="M1 3H23V8H1V3Z" />
        <path d="M10 12H14" />
      </svg>
    ),
  },
  {
    href: "/catalog/units",
    label: "Unidades Medida",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3V21" />
        <path d="M17 5H7" />
        <path d="M17 10H7" />
        <path d="M17 15H7" />
      </svg>
    ),
  },
  {
    href: "/catalog/suppliers",
    label: "Proveedores",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isAdmin = session?.rol === "ADMIN";

  const NavLink = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <a
        key={href}
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "9px 10px",
          borderRadius: "var(--radius-md)",
          fontSize: "14px",
          fontWeight: isActive ? 600 : 400,
          color: isActive ? "var(--neutral-50)" : "var(--neutral-400)",
          background: isActive ? "var(--bg-card)" : "transparent",
          border: isActive ? "1px solid var(--border-default)" : "1px solid transparent",
          textDecoration: "none",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = "var(--neutral-100)";
            e.currentTarget.style.background = "var(--bg-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = "var(--neutral-400)";
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        <span style={{ color: isActive ? "var(--brand-500)" : "currentColor", display: "flex" }}>
          {icon}
        </span>
        {label}
        {label === "Alertas" && (
          <span
            style={{
              marginLeft: "auto",
              background: "var(--brand-500)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              borderRadius: "20px",
              padding: "1px 6px",
              minWidth: "18px",
              textAlign: "center",
            }}
          >
            !
          </span>
        )}
      </a>
    );
  };

  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        height: "100dvh",
        position: "sticky",
        top: 0,
        background: "var(--bg-base)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 20px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            background: "var(--brand-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--neutral-50)",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-sans)",
          }}
        >
          OptiPlant
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
        <p style={{
          fontSize: "10.5px",
          fontWeight: 600,
          color: "var(--neutral-500)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "0 8px",
          marginBottom: "8px",
        }}>Menú</p>
        
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {isAdmin && (
          <>
            <p style={{
              fontSize: "10.5px",
              fontWeight: 600,
              color: "var(--neutral-500)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0 8px",
              marginTop: "24px",
              marginBottom: "8px",
            }}>Administración</p>
            {adminItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}

            <p style={{
              fontSize: "10.5px",
              fontWeight: 600,
              color: "var(--neutral-500)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0 8px",
              marginTop: "24px",
              marginBottom: "8px",
            }}>Configuración Maestra</p>
            {masterItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Profile & Logout */}
      <div style={{ padding: "0 12px", borderTop: "1px solid var(--border-default)", paddingTop: "16px", marginTop: "8px" }}>
        {session && (
          <div style={{ padding: "0 10px", marginBottom: "12px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--neutral-100)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.nombre}</p>
            <p style={{ fontSize: "11px", color: "var(--neutral-500)" }}>{session.rol}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 10px",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            color: "var(--neutral-400)",
            background: "transparent",
            border: "1px solid transparent",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-danger)";
            e.currentTarget.style.background = "rgba(224,112,112,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--neutral-400)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
