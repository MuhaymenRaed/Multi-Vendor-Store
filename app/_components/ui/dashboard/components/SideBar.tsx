"use client";

import {
  ArrowLeft,
  ClipboardList,
  DollarSign,
  Moon,
  Package,
  Shield,
  Store,
  Sun,
  TrendingUp,
  Users,
  X, // Changed to X for clear "Close" action
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { TabType } from "../types";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onBack: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navigationItems = [
  { id: "overview" as const, label: "نظرة عامة", icon: TrendingUp },
  {
    id: "requests" as const,
    label: "طلبات المتاجرة",
    icon: ClipboardList,
  },
  { id: "users" as const, label: "المستخدمين", icon: Users },
  { id: "stores" as const, label: "المتاجر", icon: Store },
  { id: "products" as const, label: "المنتجات", icon: Package },
  { id: "revenue" as const, label: "الإيرادات", icon: DollarSign },
];

export function Sidebar({
  activeTab,
  onTabChange,
  onBack,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabClick = (id: TabType) => {
    onTabChange(id);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      )}

      <aside
        className={`fixed right-0 top-0 h-full w-72 border-l z-50 transition-transform duration-300 ease-in-out p-6 
          bg-sidebar/95 backdrop-blur-md border-sidebar-border shadow-2xl
          ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between mb-10">
          <button
            type="button"
            onClick={onBack}
            className="flex cursor-pointer items-center gap-2 transition-colors text-sidebar-foreground/60 hover:text-marketplace-accent group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs font-bold">العودة للسوق</span>
          </button>

          <div className="flex gap-2 relative z-[60]">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 cursor-pointer rounded-xl bg-sidebar-accent text-sidebar-primary hover:bg-sidebar-accent/80 transition-all active:scale-95"
            >
              {!mounted ? (
                <div className="w-4 h-4" />
              ) : theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* THE MENU CLOSE BUTTON - BULLETPROOF VERSION */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Stops form submissions if wrapped in one
                e.stopPropagation(); // Stops the click from firing parent events
                console.log("Close button clicked!"); // Check your console to verify the click registers
                setIsOpen(false);
              }}
              className="md:hidden flex items-center justify-center p-2 cursor-pointer rounded-xl bg-sidebar-accent/50 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ADMIN BADGE */}
        <div className="flex items-center gap-3 mb-10 p-4 rounded-2xl border border-marketplace-accent/10 bg-linear-to-l from-marketplace-accent/[0.05] to-transparent">
          <div className="bg-marketplace-accent/10 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-marketplace-accent" />
          </div>
          <div>
            <div className="font-bold text-sm text-sidebar-foreground tracking-tight">
              لوحة الإدارة
            </div>
            <div className="text-[10px] text-marketplace-accent font-medium uppercase tracking-wider">
              مالك المنصة
            </div>
          </div>
        </div>

        <nav className="space-y-1.5 relative z-50">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick(item.id);
                }}
                className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm group relative
                  ${
                    isActive
                      ? "bg-marketplace-accent text-white shadow-lg shadow-marketplace-accent/25 scale-[1.02]"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                />
                {item.label}
                {isActive && (
                  <div className="absolute left-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
