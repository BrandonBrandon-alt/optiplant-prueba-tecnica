"use client";

import React, { useEffect, useState } from "react";
import { type ToastType } from "@/context/ToastContext";

interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function Toast({ type, title, message, onClose }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  // Icons based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case "error":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        );
      case "warning":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case "info":
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const colors = {
    success: {
      bg: "rgba(111,191,138,0.12)",
      border: "rgba(111,191,138,0.3)",
      icon: "var(--color-success)",
      title: "var(--neutral-100)",
      message: "var(--neutral-300)"
    },
    error: {
      bg: "rgba(235,103,103,0.12)",
      border: "rgba(235,103,103,0.3)",
      icon: "var(--brand-500)",
      title: "var(--neutral-100)",
      message: "var(--neutral-300)"
    },
    warning: {
      bg: "rgba(240,192,86,0.12)",
      border: "rgba(240,192,86,0.3)",
      icon: "var(--color-warning)",
      title: "var(--neutral-100)",
      message: "var(--neutral-300)"
    },
    info: {
      bg: "rgba(103,163,235,0.12)",
      border: "rgba(103,163,235,0.3)",
      icon: "#67a3eb",
      title: "var(--neutral-100)",
      message: "var(--neutral-300)"
    }
  };

  const currentColors = colors[type];

  return (
    <div
      style={{
        width: "320px",
        background: "var(--bg-card)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${currentColors.border}`,
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        display: "flex",
        gap: "14px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        animation: isClosing ? "fadeOutRight 0.3s ease forwards" : "fadeInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pointerEvents: "auto",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Type indicator stripe */}
      <div 
        style={{ 
          position: "absolute", 
          left: 0, 
          top: 0, 
          bottom: 0, 
          width: "4px", 
          background: currentColors.icon 
        }} 
      />

      <div 
        style={{ 
          color: currentColors.icon, 
          flexShrink: 0,
          marginTop: "2px"
        }}
      >
        {getIcon()}
      </div>

      <div style={{ flex: 1 }}>
        {title && (
          <p style={{ 
            fontSize: "14px", 
            fontWeight: 600, 
            color: currentColors.title,
            marginBottom: "4px" 
          }}>
            {title}
          </p>
        )}
        <p style={{ 
          fontSize: "13px", 
          color: currentColors.message, 
          lineHeight: 1.5 
        }}>
          {message}
        </p>
      </div>

      <button
        onClick={() => {
          setIsClosing(true);
          setTimeout(onClose, 300);
        }}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--neutral-500)",
          cursor: "pointer",
          padding: "2px",
          height: "fit-content",
          borderRadius: "4px",
          transition: "all 0.15s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--neutral-100)";
          e.currentTarget.style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--neutral-500)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar animation fallback (CSS) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeOutRight {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(20px) scale(0.95); }
        }
      `}} />
    </div>
  );
}
