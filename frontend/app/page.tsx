"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/api/auth";

/**
 * Redirige la ruta raíz "/" al Dashboard si hay sesión activa,
 * o a la pantalla de Login si no la hay.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  // Pantalla de carga intermedia mientras se resuelve la redirección
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px var(--brand-glow)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand-500)"
          strokeWidth="2.5"
          style={{ animation: "spin 0.7s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.22-8.56" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
