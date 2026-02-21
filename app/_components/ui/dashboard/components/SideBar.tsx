"use client";

import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Sun,
  Moon,
  Shield,
  TrendingUp,
  Users,
  Store,
  Package,
  DollarSign,
  X,
} from "lucide-react";
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

  return (
    <aside
      className={`fixed right-0 top-0 h-full w-64 border-l z-50 transition-transform duration-300 p-6 
        bg-sidebar border-sidebar-border
        ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 transition-colors text-sidebar-foreground hover:text-marketplace-accent"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">العودة للسوق</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-sidebar-accent text-sidebar-primary"
          >
            <Sun className="w-4 h-4 hidden dark:block" />
            <Moon className="w-4 h-4 block dark:hidden" />
          </button>

          {/* Close button for mobile only */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-sidebar-foreground"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8 p-3 rounded-xl border bg-gradient-to-l from-marketplace-accent/10 to-transparent border-marketplace-accent/20">
        <Shield className="w-6 h-6 text-marketplace-accent" />
        <div>
          <div className="font-bold text-sm text-sidebar-foreground">
            لوحة الإدارة
          </div>
          <div className="text-[10px] text-marketplace-text-secondary">
            مالك المنصة
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                isActive
                  ? "bg-marketplace-accent text-white shadow-lg shadow-marketplace-accent/20 scale-[1.02]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
