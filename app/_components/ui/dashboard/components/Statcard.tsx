"use client";

import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  Package,
  DollarSign,
} from "lucide-react";
import type { Stat } from "../types";

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Users,
  Store,
  Package,
  DollarSign,
};

interface StatCardProps {
  stat: Stat;
  index: number;
}

export function StatCard({ stat, index }: StatCardProps) {
  const Icon = iconMap[stat.icon] || Users;
  const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-border rounded-xl p-6 transition-all duration-300 
                 bg-marketplace-card shadow-sm hover:border-marketplace-accent"
    >
      <div className="flex items-center justify-between mb-4">
        {/* We keep the dynamic inline style for the specific stat color */}
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${stat.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: stat.color }} />
        </div>

        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            stat.trend === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          <TrendIcon className="w-4 h-4" />
          {stat.change}
        </div>
      </div>

      <div className="text-3xl font-bold mb-1 text-marketplace-text-primary">
        {stat.value}
      </div>

      <div className="text-sm text-marketplace-text-secondary">
        {stat.label}
      </div>
    </motion.div>
  );
}
