"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle2,
  Store,
} from "lucide-react";

interface OrderRevenueItem {
  id: string;
  date: string;
  month: string;
  year: number;
  storeName: string;
  productName: string;
  price: number;
  profit: number;
  status: string;
}

export function RevenueTab({
  revenueData = [],
}: {
  revenueData: OrderRevenueItem[];
}) {
  // 1. STATE & FILTERS
  const years = useMemo(
    () =>
      Array.from(new Set(revenueData.map((d) => d.year))).sort((a, b) => b - a),
    [revenueData],
  );
  const storeNames = useMemo(
    () => Array.from(new Set(revenueData.map((d) => d.storeName))),
    [revenueData],
  );

  const [selectedYear, setSelectedYear] = useState(
    years[0] || new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState("الكل");
  const [selectedStore, setSelectedStore] = useState("الكل");

  const monthsList = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  // 2. FILTERING LOGIC
  const filteredData = useMemo(() => {
    return revenueData.filter((d) => {
      const matchYear = d.year === selectedYear;
      const matchMonth = selectedMonth === "الكل" || d.month === selectedMonth;
      const matchStore =
        selectedStore === "الكل" || d.storeName === selectedStore;
      return matchYear && matchMonth && matchStore;
    });
  }, [revenueData, selectedYear, selectedMonth, selectedStore]);

  // 3. AGGREGATE TOTALS FROM FILTERED INDIVIDUAL ORDERS
  const totals = useMemo(() => {
    let verifiedPrice = 0,
      verifiedProfit = 0,
      verifiedCount = 0;
    let pendingPrice = 0,
      pendingProfit = 0,
      pendingCount = 0;

    filteredData.forEach((order) => {
      if (order.status === "verified_sold") {
        verifiedPrice += order.price;
        verifiedProfit += order.profit;
        verifiedCount++;
      } else if (order.status === "pending_verification") {
        pendingPrice += order.price;
        pendingProfit += order.profit;
        pendingCount++;
      }
    });

    return {
      verifiedPrice,
      verifiedProfit,
      verifiedCount,
      pendingPrice,
      pendingProfit,
      pendingCount,
    };
  }, [filteredData]);

  // 4. CHART DATA FORMATTING (Chronological Points)
  const chartData = useMemo(() => {
    return filteredData.map((order) => {
      const d = new Date(order.date);
      return {
        ...order,
        displayTime: `${d.getDate()} ${order.month} - ${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`,
        shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
      };
    });
  }, [filteredData]);

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-marketplace-text-primary tracking-tight">
            السجل المالي التفصيلي
          </h2>
          <p className="text-marketplace-text-secondary mt-1">
            تتبع أرباح الإدارة لكل طلب وكل منتج على حدة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Store Filter */}
          <div className="flex items-center gap-2 bg-marketplace-card border border-marketplace-border px-4 py-2.5 rounded-2xl shadow-sm">
            <Store size={18} className="text-marketplace-accent" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none text-marketplace-text-primary cursor-pointer"
            >
              <option value="الكل">جميع المتاجر</option>
              {storeNames.map((s) => (
                <option key={s} value={s} className="bg-marketplace-card">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-2 bg-marketplace-card border border-marketplace-border px-4 py-2.5 rounded-2xl shadow-sm">
            <Calendar size={18} className="text-marketplace-accent" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold outline-none text-marketplace-text-primary cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-marketplace-card">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2 bg-marketplace-card border border-marketplace-border px-4 py-2.5 rounded-2xl shadow-sm">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none text-marketplace-text-primary cursor-pointer"
            >
              <option value="الكل">كل الأشهر</option>
              {monthsList.map((m) => (
                <option key={m} value={m} className="bg-marketplace-card">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "أرباح الإدارة (مؤكد)",
            value: totals.verifiedProfit,
            sub: `${totals.verifiedCount} طلب ناجح`,
            icon: <CheckCircle2 />,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "أرباح الإدارة (معلق)",
            value: totals.pendingProfit,
            sub: `${totals.pendingCount} طلب قيد التدقيق`,
            icon: <Clock />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "إجمالي قيمة المبيعات",
            value: totals.verifiedPrice,
            sub: "أسعار المنتجات المباعة",
            icon: <TrendingUp />,
            color: "text-marketplace-accent",
            bg: "bg-marketplace-accent/10",
          },
          {
            label: "إجمالي العمليات",
            value: totals.verifiedCount + totals.pendingCount,
            sub: "جميع الطلبات",
            icon: <FileText />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
        ].map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-marketplace-card border border-marketplace-border p-6 rounded-[2rem] shadow-sm hover:border-marketplace-accent/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}
              >
                {card.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-marketplace-text-secondary opacity-50">
                بيانات الطلبات
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-marketplace-text-secondary text-xs font-bold">
                {card.label}
              </p>
              <h3
                className="text-2xl font-black text-marketplace-text-primary"
                dir="ltr"
              >
                {card.label.includes("العمليات")
                  ? card.value
                  : `${card.value.toLocaleString("en-US")} د.ع`}
              </h3>
              <p className={`text-[11px] font-bold ${card.color}`}>
                {card.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- CHART SECTION (Plots Individual Orders Chronologically) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 bg-marketplace-card border border-marketplace-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-marketplace-text-primary">
              مخطط الطلبات الزمني - {selectedStore}
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-marketplace-accent" />{" "}
                سعر الطلب
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500" /> ربح
                الإدارة
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(128,128,128,0.15)"
                />
                <XAxis
                  dataKey="shortDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9e9e9e", fontSize: 11 }}
                  dy={10}
                  minTickGap={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9e9e9e", fontSize: 11 }}
                  tickFormatter={(val: any) => `${val / 1000}k`}
                  dx={-10}
                />
                <Tooltip
                  labelFormatter={(label, payload) =>
                    payload[0]?.payload.displayTime || label
                  }
                  formatter={(value, name, props) => [
                    `${Number(value).toLocaleString("en-US")} د.ع`,
                    name === "price" ? "قيمة المنتج" : "ربح الإدارة",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--marketplace-card-bg)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    textAlign: "right",
                    direction: "rtl",
                  }}
                  itemSorter={(item) => (item.name === "profit" ? -1 : 1)}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#00bcd4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* --- DETAILED TRANSACTION TABLE --- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-marketplace-card border border-marketplace-border rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col"
        >
          <div className="p-6 border-b border-marketplace-border bg-marketplace-bg/30">
            <h3 className="text-lg font-black text-marketplace-text-primary">
              سجل الطلبات
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <table className="w-full text-right border-collapse">
              <thead className="sticky top-0 bg-marketplace-card/90 backdrop-blur-md text-[10px] font-black uppercase text-marketplace-text-secondary border-b border-marketplace-border z-10">
                <tr>
                  <th className="px-6 py-4">المنتج / المتجر</th>
                  <th className="px-6 py-4">السعر والأرباح</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marketplace-border">
                {chartData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-marketplace-card-hover transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-sm text-marketplace-text-primary truncate max-w-[120px]"
                          title={row.productName}
                        >
                          {row.productName}
                        </span>
                        <span className="text-[10px] text-marketplace-text-secondary mt-1">
                          {row.storeName} • {row.displayTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col" dir="ltr">
                        <span className="text-sm font-black text-marketplace-accent">
                          {row.price.toLocaleString("en-US")} د.ع
                        </span>
                        <span className="text-[10px] text-green-500 font-bold mt-1">
                          +{row.profit.toLocaleString("en-US")} د.ع عمولة
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border ${
                          row.status === "verified_sold"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {row.status === "verified_sold" ? "مؤكد" : "معلق"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {chartData.length === 0 && (
              <div className="p-8 text-center text-marketplace-text-secondary text-sm font-bold">
                لا توجد طلبات لهذه الفترة.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
