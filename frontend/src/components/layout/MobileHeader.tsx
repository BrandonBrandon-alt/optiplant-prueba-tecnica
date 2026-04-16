"use client";

import React from "react";

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export default function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <header
      className="show-mobile"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--header-height)",
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border-default)",
        zIndex: 1000,
        padding: "0 var(--page-padding)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            background: "var(--brand-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--neutral-50)", letterSpacing: "-0.01em" }}>
          OptiPlant
        </span>
      </div>

      <button
        onClick={onMenuOpen}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--neutral-100)",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </header>
  );
}
