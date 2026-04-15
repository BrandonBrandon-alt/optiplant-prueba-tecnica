// EmptyState.tsx – Estado vacío genérico reutilizable

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          color: "var(--neutral-600)",
          marginBottom: "4px",
          opacity: 0.7,
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--neutral-400)" }}>
        {title}
      </p>
      {description && (
        <p style={{ fontSize: "13px", color: "var(--neutral-600)", maxWidth: "280px" }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: "8px" }}>{action}</div>}
    </div>
  );
}
