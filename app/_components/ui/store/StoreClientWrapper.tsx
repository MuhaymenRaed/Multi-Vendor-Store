"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Mail, Phone, Globe, PackageOpen } from "lucide-react";
import { ProductCard } from "@/app/_components/ui/product/ProductCard";
import { ProductModal } from "@/app/_components/ui/product/ProductModal";

// Define generic types for your data
interface StoreClientWrapperProps {
  store: any; // Replace 'any' with your actual Store type interface
  initialProducts: any[];
}

export function StoreClientWrapper({
  store,
  initialProducts,
}: StoreClientWrapperProps) {
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Sorting Logic (happens on client side for speed)
  const sortedProducts = [...initialProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    // Default to newest (assuming larger ID = newer, or use a date field)
    return b.id - a.id;
  });

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <motion.div
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-marketplace-bg transition-colors duration-300"
    >
      {/* Back button header */}
      <div className="border-b border-border bg-marketplace-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-marketplace-text-secondary hover:text-marketplace-accent transition-colors font-medium w-fit"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>

      {/* Store Header Section */}
      <div className="border-b border-border bg-gradient-to-b from-marketplace-card to-marketplace-bg">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Store Logo */}
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-border flex-shrink-0 bg-marketplace-bg shadow-sm">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-marketplace-accent/5">
                  <span className="text-4xl font-bold text-marketplace-accent/20">
                    {store.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1 text-right">
              <h1 className="text-4xl font-bold text-marketplace-text-primary mb-3 tracking-tight">
                {store.name}
              </h1>
              <p className="text-lg text-marketplace-text-secondary mb-6 max-w-3xl leading-relaxed">
                {store.description || "لا يوجد وصف لهذا المتجر."}
              </p>

              <div className="flex flex-wrap gap-6">
                {store.email && (
                  <div className="flex items-center gap-2 text-marketplace-text-secondary">
                    <Mail className="w-4 h-4 text-marketplace-accent" />
                    <span className="text-sm font-medium">{store.email}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-marketplace-text-secondary">
                    <Phone className="w-4 h-4 text-marketplace-accent" />
                    <span className="text-sm font-medium">{store.phone}</span>
                  </div>
                )}
                {store.website && (
                  <div className="flex items-center gap-2 text-marketplace-text-secondary">
                    <Globe className="w-4 h-4 text-marketplace-accent" />
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline"
                    >
                      {store.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="text-right">
            <h2 className="text-2xl font-bold text-marketplace-text-primary mb-1">
              المنتجات
            </h2>
            <p className="text-marketplace-text-secondary">
              يوجد {initialProducts.length} منتج متاح حالياً
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-marketplace-card border border-border rounded-xl text-marketplace-text-primary outline-none text-sm transition-all focus:ring-2 focus:ring-marketplace-accent/20"
            >
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: من الأقل للأعلى</option>
              <option value="price-high">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border rounded-3xl bg-marketplace-card/30">
            <PackageOpen className="w-16 h-16 text-marketplace-text-secondary/50 mb-4" />
            <p className="text-marketplace-text-secondary text-lg font-medium">
              لا توجد منتجات متاحة في هذا المتجر حالياً.
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </motion.div>
  );
}
