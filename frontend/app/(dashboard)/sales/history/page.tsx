"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/api/client";
import { getSession, type AuthSession } from "@/api/auth";
import { useToast } from "@/context/ToastContext";
import Spinner    from "@/components/ui/Spinner";
import Card       from "@/components/ui/Card";
import HistoryFilters from "@/components/sales-history/HistoryFilters";
import HistoryTable   from "@/components/sales-history/HistoryTable";
import SaleDetailModal from "@/components/sales-history/SaleDetailModal";

export default function SalesHistoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const sess = getSession();
    if (!sess) {
      router.push("/login");
      return;
    }
    setSession(sess);
    fetchSales();
  }, [router]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.GET("/api/v1/sales", {});
      if (data) {
        const sortedSales = [...(data as any[])].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setSales(sortedSales);
      }
    } catch (error: any) {
      showToast("Error al cargar el historial de ventas.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales;
    const term = searchTerm.toLowerCase();
    return sales.filter(sale => 
      sale.id.toString().includes(term) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(term)) ||
      (sale.branchName && sale.branchName.toLowerCase().includes(term)) ||
      (sale.userName && sale.userName.toLowerCase().includes(term))
    );
  }, [sales, searchTerm]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);

  const openDetail = (sale: any) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  if (loading && sales.length === 0) {
    return <Spinner fullPage />;
  }

  return (
    <div style={{ padding: "var(--page-padding)", maxWidth: "1350px", margin: "0 auto" }}>
      <div className="animate-fade-in">
        
        {/* Main Control Hub – Matching Inventory Structure */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--neutral-50)", letterSpacing: "-0.03em" }}>
                    Historial de Ventas
                </h1>
                <p style={{ fontSize: "13px", color: "var(--neutral-500)", marginTop: "4px" }}>
                    Gestión y auditoría de transacciones registradas en el sistema POS.
                </p>
            </div>
            {/* Action buttons could go here, matching Inventory's branch selector style */}
        </div>

        {/* Transaction Table Card – Matching Inventory Matrix style */}
        <Card style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-default)" }}>
          <HistoryFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchSales}
          />

          <HistoryTable 
            sales={filteredSales}
            onOpenDetail={openDetail}
            formatCurrency={formatCurrency}
            onRefresh={fetchSales}
          />
        </Card>
      </div>

      <SaleDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sale={selectedSale}
        isAdmin={session?.rol === "ADMIN"}
        onSaleCanceled={fetchSales}
      />
    </div>
  );
}
