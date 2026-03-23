"use client";

import { motion } from "framer-motion";
import { StatCard } from "../components/Statcard";
import {
  Store,
  ArrowUpLeft,
  ShoppingBag,
  UserPlus,
  DollarSign,
  Package,
  Users,
} from "lucide-react";

interface User {
  id: string | number;
  name: string;
  email: string;
  status: string;
  joined: string;
}

interface StoreItem {
  id?: string | number;
  store_id?: string | number;
  name: string;
  products: number;
  revenue: string | number;
}

interface OverviewTabProps {
  data: {
    statsData: any[];
    usersData: User[];
    storesData: StoreItem[];
  };
}

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign size={24} />,
  Package: <Package size={24} />,
  Store: <Store size={24} />,
  Users: <Users size={24} />,
};

// Helper for Arabic currency formatting with commas
const formatIQD = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US").format(num || 0);
};

export function OverviewTab({ data }: OverviewTabProps) {
  const { statsData = [], usersData = [], storesData = [] } = data;

  return (
    <div className="space-y-8" dir="rtl">
      {/* 1. STATS GRID (TOP CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const mappedIcon =
            typeof stat.icon === "string" && iconMap[stat.icon]
              ? iconMap[stat.icon]
              : stat.icon;

          // Format value if it's revenue (contains "د.ع")
          const displayValue =
            typeof stat.value === "number" ? formatIQD(stat.value) : stat.value;

          return (
            <StatCard
              key={`stat-card-${stat.label || index}-${index}`}
              stat={{ ...stat, value: displayValue, icon: mappedIcon }}
              index={index}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 2. RECENT USERS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-marketplace-card border border-marketplace-border rounded-[2.5rem] p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <h2 className="text-xl font-black text-marketplace-text-primary">
                المستخدمون الجدد
              </h2>
            </div>
            <div className="text-marketplace-text-secondary">
              <ArrowUpLeft size={20} />
            </div>
          </div>

          <div className="space-y-4">
            {usersData.length > 0 ? (
              usersData.slice(0, 5).map((user, idx) => (
                <div
                  key={user.id || `user-row-${idx}`}
                  className="group flex items-center justify-between p-4 rounded-2xl transition-all bg-marketplace-bg/50 hover:bg-marketplace-card-hover border border-transparent hover:border-marketplace-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-tr from-marketplace-accent/20 to-marketplace-accent/5 flex items-center justify-center text-marketplace-accent font-black border border-marketplace-accent/10">
                      {user.name?.charAt(0) || "م"}
                    </div>
                    <div className="text-start min-w-0 flex-1 max-w-[140px] sm:max-w-[220px]">
                      <div className="font-bold text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors">
                        {user.name}
                      </div>
                      <div className="text-xs text-marketplace-text-secondary break-all truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-end">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                        user.status === "نشط"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {user.status}
                    </span>
                    <span className="text-[10px] text-marketplace-text-secondary opacity-60 italic">
                      {user.joined}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-marketplace-text-secondary text-sm">
                لا يوجد مستخدمين جدد حالياً
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. TOP STORES CARD (WITH FORMATTED REVENUE) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-marketplace-card border border-marketplace-border rounded-[2.5rem] p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-marketplace-accent/10 text-marketplace-accent flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <h2 className="text-xl font-black text-marketplace-text-primary">
                أفضل المتاجر أداءً
              </h2>
            </div>
            <button className=" text-marketplace-text-secondary transition-colors">
              <ArrowUpLeft size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {storesData.slice(0, 5).map((store, idx) => {
              return (
                <div
                  key={store.store_id || store.id || `store-row-${idx}`}
                  className="group flex items-center justify-between p-4 rounded-2xl transition-all bg-marketplace-bg/50 hover:bg-marketplace-card-hover border border-transparent hover:border-marketplace-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-text-secondary group-hover:text-marketplace-accent transition-colors">
                      <Store size={22} />
                    </div>
                    <div className="text-start">
                      <div className="font-bold text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors">
                        {store.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-marketplace-text-secondary">
                        <span className="font-bold text-marketplace-accent">
                          {store.products || 0}
                        </span>
                        <span>منتج مسجل</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div
                      className="text-lg font-black text-marketplace-text-primary flex items-center justify-end gap-1"
                      dir="rtl"
                    >
                      {/* Formats 35015.00 to 35,015 */}
                      <span>{formatIQD(store.revenue)}</span>
                      <span className="text-xs font-bold text-marketplace-text-secondary">
                        د.ع
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
