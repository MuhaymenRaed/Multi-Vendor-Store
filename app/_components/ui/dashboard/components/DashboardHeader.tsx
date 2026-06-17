import type { TabType } from "../types";

interface DashboardHeaderProps {
  activeTab: TabType;
}

const tabTitles: Record<TabType, string> = {
  overview: "نظرة عامة على لوحة التحكم",
  users: "إدارة المستخدمين",
  stores: "إدارة المتاجر",
  products: "إدارة المنتجات",
  discounts: "إدارة الخصومات",
  revenue: "تحليلات الإيرادات",
  requests: "الطلبات",
};

export function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  return (
    <h1 className="text-3xl font-bold mb-8 text-marketplace-text-primary">
      {tabTitles[activeTab]}
    </h1>
  );
}
