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

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <motion.div
      dir="rtl" // Explicitly setting RTL for the component
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-[var(--marketplace-card-bg)] rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer group hover:border-[var(--marketplace-accent)]/50 transition-all shadow-sm hover:shadow-md"
    >
      {/* Product image container */}
      <div className="relative aspect-square bg-[var(--marketplace-bg)] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-[var(--marketplace-accent)]/10 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Product info - text-right ensured for Arabic script */}
      <div className="p-4 text-right">
        <h4 className="font-bold text-[var(--marketplace-text-primary)] mb-1 group-hover:text-[var(--marketplace-accent)] transition-colors line-clamp-1">
          {product.name}
        </h4>

        {product.category && (
          <p className="text-xs text-[var(--marketplace-text-secondary)] mb-3">
            {product.category}
          </p>
        )}

        {/* Price alignment: 
          'flex-row' in 'dir="rtl"' puts the currency on the right and the number on the left.
          To keep the standard Arabic format (Currency Number), we use flex-row.
        */}
        <div className="text-lg font-black text-[var(--marketplace-accent)] flex items-center gap-1.5 flex-row">
          <span className="text-sm font-bold">د.إ</span>
          <span>{product.price.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
