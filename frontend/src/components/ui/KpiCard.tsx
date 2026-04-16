"use client";

import React from "react";

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
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: `fadeIn 0.4s ease-out ${delay ?? "0s"} both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "var(--neutral-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-md)",
            background: accent ? `${accent}12` : "var(--bg-hover)",
            border: `1px solid ${accent ? `${accent}20` : "var(--border-default)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent ?? "var(--neutral-400)",
          }}
        >
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 }) : icon}
        </div>
      </div>
      <div>
        <p
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--neutral-50)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginBottom: sub ? "6px" : 0,
          }}
          className="tabular"
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: "12px", color: "var(--neutral-500)", fontWeight: 500 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}
