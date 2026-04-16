"use client";

import { useEffect, useRef } from "react";
import { apiClient } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { getSession } from "@/api/auth";

export default function GlobalAlertPoller() {
  const { showToast } = useToast();
  const processedAlertIds = useRef<Set<number>>(new Set());
  const isFirstRun = useRef(true);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const pollAlerts = async () => {
      try {
        // Consultar alertas activas
        const res = await apiClient.GET("/api/v1/alerts", {
          params: { query: { branchId: session.sucursalId as number } }
        });

        if (res.data) {
          const newAlerts = res.data.filter(alert => !processedAlertIds.current.has(alert.id!));
          
          if (newAlerts.length > 0) {
            newAlerts.forEach(alert => {
              // Si es la primera ejecución, solo las marcamos como procesadas para no saturar al entrar
              if (!isFirstRun.current) {
                showToast(alert.message || "Bajo stock detectado", "warning", "Alerta de Inventario");
              }
              processedAlertIds.current.add(alert.id!);
            });
          }
        }
        isFirstRun.current = false;
      } catch (error) {
        console.error("Error polling alerts:", error);
      }
    };

    // Ejecutar inmediatamente y luego cada 45 segundos
    pollAlerts();
    const interval = setInterval(pollAlerts, 45000);

    return () => clearInterval(interval);
  }, [showToast]);

  return null; // Componente invisible
}
