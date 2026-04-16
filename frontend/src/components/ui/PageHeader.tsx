// PageHeader.tsx – Cabecera de página reutilizable
// Título serif + descripción con soporte para acento italic coral

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "32px", animation: "fadeInUp 0.4s ease both", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "30px",
            fontWeight: 700,
            color: "var(--neutral-50)",
            letterSpacing: "-0.03em",
            marginBottom: description ? "6px" : 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: "14px", color: "var(--neutral-400)" }}>{description}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
