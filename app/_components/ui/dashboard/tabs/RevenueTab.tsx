"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

interface RevenueTabProps {
  revenueData: {
    month: string;
    revenue: number;
    orders: number;
    growth: number;
  }[];
  statsData: any[];
}

export function RevenueTab({ revenueData, statsData }: RevenueTabProps) {
  const totalRev = statsData.find((s) => s.label === "الإيرادات");
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
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      Icon: DollarSign,
    },
    {
      label: "إجمالي الطلبات",
      value: totalOrdersCount.toLocaleString("ar-EG"),
      trend: "+12.5%",
      trendType: "up",
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      Icon: Package,
    },
    {
      label: "متوسط قيمة الطلب",
      value: `${avgOrderValue} $`,
      trend: "+5.2%",
      trendType: "up",
      color: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-500",
      Icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10" dir="rtl">
      {/* 1. STATS GRID - Responsive 1 to 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {summaryItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative group overflow-hidden bg-marketplace-card border border-marketplace-border rounded-[1.8rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-sm"
          >
            <div
              className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${item.color} blur-3xl rounded-full opacity-40 group-hover:opacity-100 transition-opacity`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-emerald-500">
                  <item.Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-black ${
                    item.trendType === "up"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {item.trendType === "up" ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {item.trend}
                </div>
              </div>
              <p className="text-marketplace-text-secondary text-xs md:text-sm font-bold mb-1">
                {item.label}
              </p>
              <h3 className="text-2xl md:text-4xl font-black text-marketplace-text-primary tracking-tight">
                {item.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. REVENUE ANALYSIS CONTAINER */}
      <div className="bg-marketplace-card border border-marketplace-border rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-sm">
        <div className="p-6 md:p-10 border-b border-marketplace-border flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-marketplace-text-primary">
              تحليل الإيرادات
            </h2>
            <p className="text-marketplace-text-secondary text-xs md:text-sm mt-1">
              تتبع النمو المالي شهرياً
            </p>
          </div>
          <button className="hidden sm:flex p-3 rounded-xl bg-marketplace-bg border border-marketplace-border text-marketplace-text-secondary hover:text-marketplace-accent transition-colors">
            <ArrowUpRight size={20} />
          </button>
        </div>

        {/* MOBILE VIEW: Card List (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-marketplace-border">
          {revenueData.map((data) => (
            <div key={data.month} className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-marketplace-text-primary">
                  {data.month}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${data.growth >= 10 ? "text-emerald-500 bg-emerald-500/5" : "text-amber-500 bg-amber-500/5"}`}
                >
                  {data.growth >= 10 ? "ممتاز" : "مستقر"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-marketplace-text-secondary uppercase font-bold">
                    الإيرادات
                  </p>
                  <p className="text-marketplace-accent font-black">
                    {data.revenue.toLocaleString()} $
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-marketplace-text-secondary uppercase font-bold">
                    النمو
                  </p>
                  <p
                    className={`font-bold flex items-center gap-1 ${data.growth >= 0 ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {data.growth >= 0 ? "+" : ""}
                    {data.growth}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-marketplace-bg/30">
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  الشهر
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  صافي الإيرادات
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  الطلبات
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  النمو
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  الأداء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marketplace-border/50">
              {revenueData.map((data) => (
                <tr
                  key={data.month}
                  className="group hover:bg-marketplace-card-hover transition-colors"
                >
                  <td className="px-8 py-6 font-black text-marketplace-text-primary text-lg">
                    {data.month}
                  </td>
                  <td className="px-8 py-6 text-marketplace-accent font-black text-lg">
                    {data.revenue.toLocaleString()} $
                  </td>
                  <td className="px-8 py-6 font-bold text-marketplace-text-primary">
                    {data.orders}
                  </td>
                  <td className="px-8 py-6">
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${data.growth >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
                    >
                      {data.growth >= 0 ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      {data.growth}%
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <PerformanceBadge growth={data.growth} />
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

function PerformanceBadge({ growth }: { growth: number }) {
  if (growth >= 10)
    return (
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10 w-fit">
        <CheckCircle2 size={16} />
        <span className="text-[10px] font-black uppercase">ممتاز</span>
      </div>
    );
  if (growth >= 0)
    return (
      <div className="flex items-center gap-2 text-amber-600 bg-amber-500/5 px-3 py-1 rounded-lg border border-amber-500/10 w-fit">
        <AlertCircle size={16} />
        <span className="text-[10px] font-black uppercase">مستقر</span>
      </div>
    );
  return (
    <div className="flex items-center gap-2 text-red-600 bg-red-500/5 px-3 py-1 rounded-lg border border-red-500/10 w-fit">
      <AlertCircle size={16} />
      <span className="text-[10px] font-black uppercase">تراجع</span>
    </div>
  );
}
