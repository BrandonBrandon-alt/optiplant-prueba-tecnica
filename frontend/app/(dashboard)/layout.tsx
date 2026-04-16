"use client";

import Sidebar from "@/components/layout/Sidebar";
import GlobalAlertPoller from "@/components/alerts/GlobalAlertPoller";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/api/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
    }
  }, [router]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "row", // Desktop default
        minHeight: "100dvh", 
        background: "var(--bg-surface)",
        position: "relative"
      }}
    >
      <GlobalAlertPoller />
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: "100dvh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
