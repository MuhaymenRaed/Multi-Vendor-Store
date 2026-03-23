"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  stat: {
    label: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down";
    icon?: React.ReactNode;
    color?: string;
  };
  index: number;
}

export function StatCard({ stat, index }: StatCardProps) {
  const isUp =
    stat.trend === "up" || (stat.change && stat.change.startsWith("+"));
  const changeValue = stat.change || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className="relative group overflow-hidden bg-marketplace-card border border-marketplace-border rounded-[2rem] p-7 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Ambient glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-marketplace-accent/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          {stat.icon && (
            <div className="w-10 h-10 rounded-xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-accent">
              {stat.icon}
            </div>
          )}
          {changeValue && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${isUp ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}
            >
              {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {changeValue}
            </div>
          )}
        </div>
        <p className="text-marketplace-text-secondary text-xs font-bold uppercase tracking-widest mb-1">
          {stat.label}
        </p>
        <h3 className="text-3xl font-black text-marketplace-text-primary tracking-tight">
          {typeof stat.value === "number"
            ? stat.value.toLocaleString("en-US")
            : stat.value}
        </h3>
      </div>
    </motion.div>
  );
}
