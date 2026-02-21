"use client";

import { motion } from "framer-motion";
import { StatCard } from "../components/Statcard";
import {
  Users,
  Store,
  ArrowUpRight,
  ShoppingBag,
  UserPlus,
} from "lucide-react";

interface OverviewTabProps {
  data: {
    statsData: any[];
    usersData: any[];
    storesData: any[];
  };
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { statsData, usersData, storesData } = data;

  return (
    <div className="space-y-8" dir="rtl">
      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 2. RECENT USERS CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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
            <button className="text-marketplace-text-secondary hover:text-marketplace-accent transition-colors">
              <ArrowUpRight size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {usersData.slice(0, 5).map((user, idx) => (
              <div
                key={user.id}
                className="group flex items-center justify-between p-4 rounded-2xl transition-all bg-marketplace-bg/50 hover:bg-marketplace-card-hover border border-transparent hover:border-marketplace-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-marketplace-accent/20 to-marketplace-accent/5 flex items-center justify-center text-marketplace-accent font-black border border-marketplace-accent/10">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors">
                      {user.name}
                    </div>
                    <div className="text-xs text-marketplace-text-secondary">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
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
            ))}
          </div>
        </motion.div>

        {/* 3. TOP STORES CARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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
            <button className="text-marketplace-text-secondary hover:text-marketplace-accent transition-colors">
              <ArrowUpRight size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {storesData.slice(0, 5).map((store) => (
              <div
                key={store.id}
                className="group flex items-center justify-between p-4 rounded-2xl transition-all bg-marketplace-bg/50 hover:bg-marketplace-card-hover border border-transparent hover:border-marketplace-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-text-secondary group-hover:text-marketplace-accent transition-colors">
                    <Store size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors">
                      {store.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-marketplace-text-secondary">
                      <span className="font-bold text-marketplace-accent">
                        {store.products}
                      </span>
                      <span>منتج مسجل</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-black text-marketplace-text-primary">
                    {store.revenue}
                  </div>
                  <div className="text-[10px] text-green-500 font-bold">
                    نمو +12%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
