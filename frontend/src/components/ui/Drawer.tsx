"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "500px",
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open && !overlayRef.current) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`absolute top-0 right-0 h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl transition-transform duration-300 transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: `min(${width}, 100vw)` }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-neutral-50 uppercase tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-[12px] text-neutral-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-500 hover:text-neutral-100 hover:bg-neutral-800 transition-all"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="absolute bottom-0 left-0 w-full p-6 border-t border-neutral-800 bg-neutral-900">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
