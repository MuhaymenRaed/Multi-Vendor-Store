"use client";

import { motion } from "motion/react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
  };
  onClick: () => void;
}

export function ProductCard({ product, onClick }: any) {
  return (
    <motion.div
      dir="rtl"
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="bg-marketplace-card/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/40 cursor-pointer group hover:border-marketplace-accent/30 transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden m-2 rounded-2xl">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-muted/10 flex items-center justify-center" />
        )}
        <div className="absolute inset-0 bg-marketplace-accent/0 group-hover:bg-marketplace-accent/5 transition-colors duration-300" />
      </div>

      <div className="p-5 text-right">
        <h4 className="font-bold text-marketplace-text-primary text-lg mb-1 group-hover:text-marketplace-accent transition-colors line-clamp-1">
          {product.name}
        </h4>
        <p className="text-xs text-marketplace-text-secondary font-medium mb-4">
          {product.category}
        </p>

        <div className="flex items-baseline gap-1 justify-start">
          <span className="text-2xl font-black text-marketplace-accent">
            {product.price.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-marketplace-accent opacity-80">
            د.إ
          </span>
        </div>
      </div>
    </motion.div>
  );
}
