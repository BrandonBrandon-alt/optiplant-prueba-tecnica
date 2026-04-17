import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const lora  = Lora({ subsets: ["latin"], variable: "--font-serif", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Zenvory – Sistema de Inventario",
  description: "Plataforma de gestión de inventario multi-sucursal para Zenvory .",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable} h-full`}>
      <body className="min-h-full bg-[var(--bg-base)] text-[var(--neutral-100)] antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
