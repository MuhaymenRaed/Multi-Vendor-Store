"use client";

import { motion } from "motion/react";
import { Badge } from "@/app/_components/shadCN-ui/badge";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    description: string;
    category: string;
    logo_url?: string;
    isFeatured?: boolean;
  };
}

export function StoreCard({ store }: StoreCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      dir="rtl" // Set the direction to Right-to-Left
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative bg-[var(--marketplace-card-bg)] rounded-xl overflow-hidden cursor-pointer group border transition-all duration-300 ${
        store.isFeatured
          ? "border-[var(--marketplace-accent)]/40 hover:border-[var(--marketplace-accent)] shadow-lg shadow-[var(--marketplace-accent)]/5"
          : "border-[var(--border)] hover:border-[var(--marketplace-accent)]"
      } hover:shadow-xl hover:shadow-[var(--marketplace-accent)]/10`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--marketplace-accent)] to-transparent transition-opacity duration-300 ${
          store.isFeatured ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Featured Badge - Moved to top-right (right-3) */}
      {store.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-[var(--marketplace-accent)] text-white border-none text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            رسمي
          </Badge>
        </div>
      )}

      {/* Store Image/Logo Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--marketplace-bg)]">
        {store.logo_url ? (
          <img
            src={store.logo_url}
            alt={store.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-[var(--marketplace-accent)]/10 rounded-full animate-pulse"></div>
          </div>
        )}
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[var(--foreground)]/20 to-transparent" />
      </div>

      {/* Store Info - text-right for Arabic flow */}
      <div className="p-5 text-right">
        <h3 className="text-lg font-bold mb-2 transition-colors duration-300 text-[var(--marketplace-text-primary)] group-hover:text-[var(--marketplace-accent)]">
          {store.name}
        </h3>

        <p className="text-sm mb-4 line-clamp-2 leading-relaxed text-[var(--marketplace-text-secondary)]">
          {store.description}
        </p>

        {/* Footer info - flex-row-reverse for RTL icon placement */}
        <div className="flex items-center justify-between flex-row-reverse">
          <span className="text-xs px-2 py-1 rounded-md transition-colors duration-300 bg-[var(--marketplace-bg)] text-[var(--marketplace-text-secondary)] font-medium">
            {store.category}
          </span>

          <motion.div
            initial={{ opacity: 0, x: 10 }} // Initial X set to 10 for RTL slide-in
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
            className="flex items-center gap-1 text-[var(--marketplace-accent)] text-sm font-bold"
          >
            عرض المتجر
            <ArrowLeft className="w-4 h-4" />{" "}
            {/* Points Left for Arabic "Next" */}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
