"use client";

import Sidebar from "@/components/layout/Sidebar";
import GlobalAlertPoller from "@/components/alerts/GlobalAlertPoller";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/api/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-surface)" }}>
      <GlobalAlertPoller />
      <Sidebar />
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
