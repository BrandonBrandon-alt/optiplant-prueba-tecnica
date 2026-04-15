// KpiCard.tsx – Tarjeta de métrica reutilizable

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  delay?: string;
}

export default function KpiCard({ label, value, sub, icon, accent, delay }: KpiCardProps) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        animation: `fadeInUp 0.4s ease ${delay ?? "0s"} both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", color: "var(--neutral-400)", fontWeight: 500 }}>
          {label}
        </span>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: accent ? `${accent}15` : "var(--bg-hover)",
            border: `1px solid ${accent ? `${accent}25` : "var(--border-default)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent ?? "var(--neutral-300)",
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            fontWeight: 700,
            color: "var(--neutral-50)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginBottom: sub ? "4px" : 0,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: "12px", color: "var(--neutral-500)" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}
