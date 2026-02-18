"use client";

import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface RevenueTabProps {
  revenueData: {
    month: string;
    revenue: number;
    orders: number;
    growth: number;
  }[];
  // We take statsData to fill the summary cards with live totals
  statsData: any[];
}

export function RevenueTab({ revenueData, statsData }: RevenueTabProps) {
  // Extract live values from the statsData array we built in the data file
  const totalRev = statsData.find((s) => s.label === "الإيرادات");
  const totalUsers = statsData.find((s) => s.label === "إجمالي المستخدمين"); // Just as an example

  // Calculate average order value from the revenue list
  const totalOrdersCount = revenueData.reduce(
    (acc, curr) => acc + curr.orders,
    0,
  );
  const totalRevenueSum = revenueData.reduce(
    (acc, curr) => acc + curr.revenue,
    0,
  );
  const avgOrderValue =
    totalOrdersCount > 0 ? (totalRevenueSum / totalOrdersCount).toFixed(0) : 0;

  const summaryItems = [
    {
      label: "إجمالي الإيرادات",
      value: totalRev?.value || "0 $",
      trend: totalRev?.change || "+0%",
      trendType: totalRev?.trend || "up",
      color: "text-green-500",
      IconComponent: TrendingUp,
    },
    {
      label: "إجمالي الطلبات",
      value: totalOrdersCount.toLocaleString("ar-EG"),
      trend: "+0%", // You can add order growth logic in data-service later
      trendType: "up",
      color: "text-blue-500",
      IconComponent: Package,
    },
    {
      label: "متوسط قيمة الطلب",
      value: `${avgOrderValue} $`,
      trend: "+0%",
      trendType: "up",
      color: "text-purple-500",
      IconComponent: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryItems.map((item, idx) => (
          <div
            key={idx}
            className="border border-border rounded-xl p-6 transition-colors duration-300 bg-marketplace-card shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-marketplace-text-secondary">
                {item.label}
              </div>
              <item.IconComponent className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="text-3xl font-bold text-marketplace-text-primary">
              {item.value}
            </div>
            <div
              className={`text-sm mt-1 ${item.trendType === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {item.trend} عن الشهر الماضي
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Analysis Table */}
      <div className="border border-border rounded-xl p-6 transition-colors duration-300 bg-marketplace-card shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-marketplace-text-primary">
          تحليل الإيرادات الشهرية
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-marketplace-bg/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                  الشهر
                </th>
                <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                  الإيرادات
                </th>
                <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                  الطلبات
                </th>
                <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                  النمو
                </th>
                <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {revenueData.map((data) => (
                <tr
                  key={data.month}
                  className="transition-colors hover:bg-marketplace-card-hover"
                >
                  <td className="px-6 py-4 font-semibold text-marketplace-text-primary">
                    {data.month}
                  </td>
                  <td className="px-6 py-4 text-marketplace-accent font-bold">
                    {data.revenue.toLocaleString()} $
                  </td>
                  <td className="px-6 py-4 text-marketplace-text-secondary">
                    {data.orders}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        data.growth >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {data.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>
                        {data.growth >= 0 ? "+" : ""}
                        {data.growth}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {data.growth >= 10 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : data.growth >= 0 ? (
                      <CheckCircle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
