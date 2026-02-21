"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Plus,
  Store,
  Tag,
  AlertTriangle,
  CheckCircle,
  Filter,
  Check,
} from "lucide-react";
import { TableActions, productActions } from "../components/TableActions";

interface ProductsTabProps {
  data: {
    id: string | number;
    name: string;
    store: string;
    category: string;
    price: string;
    stock: number;
    status: string;
  }[];
}

export function ProductsTab({ data }: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Filter Categories
  const categories = [
    "الكل",
    ...Array.from(new Set(data.map((p) => p.category))),
  ];

  const filteredProducts = data.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "الكل" || product.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. PRODUCT COMMAND BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-marketplace-card p-4 rounded-[2rem] border border-marketplace-border shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary group-focus-within:text-marketplace-accent transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="البحث عن منتج أو متجر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-marketplace-bg border border-transparent focus:border-marketplace-accent/20 rounded-2xl py-3 pr-11 pl-4 outline-none text-marketplace-text-primary font-bold transition-all"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-3 rounded-2xl border transition-all ${
                isFilterOpen
                  ? "bg-marketplace-accent text-white border-marketplace-accent"
                  : "bg-marketplace-bg text-marketplace-text-primary border-marketplace-border"
              }`}
            >
              <Filter size={18} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-48 bg-marketplace-card border border-marketplace-border rounded-2xl shadow-xl overflow-hidden py-2 z-50 backdrop-blur-xl"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveFilter(cat);
                        setIsFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-marketplace-card-hover transition-colors text-right"
                    >
                      <span
                        className={`text-sm font-bold ${activeFilter === cat ? "text-marketplace-accent" : "text-marketplace-text-secondary"}`}
                      >
                        {cat}
                      </span>
                      {activeFilter === cat && (
                        <Check size={14} className="text-marketplace-accent" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-marketplace-accent text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-marketplace-accent/20">
          <Plus size={18} />
          <span>إضافة منتج</span>
        </button>
      </div>

      {/* 2. PRODUCTS DATA TABLE */}
      <div className="bg-marketplace-card rounded-[2.5rem] border border-marketplace-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]">
            <thead>
              <tr className="bg-marketplace-bg/30 border-b border-marketplace-border">
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  المنتج
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  المتجر
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  الفئة
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  السعر
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  المخزون
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  الحالة
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest text-left">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marketplace-border/50">
              {filteredProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-20 text-center">
            <Package
              size={48}
              className="mx-auto text-marketplace-text-secondary opacity-20 mb-4"
            />
            <p className="text-marketplace-text-secondary font-bold">
              لا توجد منتجات تطابق بحثك حالياً
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group hover:bg-marketplace-card-hover transition-all duration-300"
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-text-secondary group-hover:text-marketplace-accent transition-colors">
            <Package size={20} />
          </div>
          <span className="text-marketplace-text-primary font-bold">
            {product.name}
          </span>
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-secondary text-sm">
          <Store size={14} className="opacity-50" />
          {product.store}
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-secondary text-sm">
          <Tag size={14} className="opacity-50 text-marketplace-accent" />
          <span className="bg-marketplace-bg px-2 py-1 rounded-lg border border-marketplace-border">
            {product.category}
          </span>
        </div>
      </td>

      <td className="px-8 py-5">
        <span className="text-marketplace-accent font-black text-lg">
          {product.price}
        </span>
      </td>

      <td className="px-8 py-5">
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <div className="flex justify-between text-[10px] font-bold">
            <span
              className={
                product.stock < 5
                  ? "text-red-500"
                  : "text-marketplace-text-secondary"
              }
            >
              {product.stock} قطع
            </span>
          </div>
          <div className="h-1.5 w-full bg-marketplace-bg rounded-full overflow-hidden border border-marketplace-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((product.stock / 50) * 100, 100)}%`,
              }}
              className={`h-full rounded-full ${
                product.stock >= 10
                  ? "bg-green-500"
                  : product.stock > 0
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
          </div>
        </div>
      </td>

      <td className="px-8 py-5">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
            product.status === "متوفر"
              ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
              : product.status === "مخزون منخفض"
                ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {product.status === "متوفر" ? (
            <CheckCircle size={12} />
          ) : (
            <AlertTriangle size={12} />
          )}
          {product.status}
        </div>
      </td>

      <td className="px-8 py-5 text-left">
        <TableActions isHovered={isHovered} actions={productActions} />
      </td>
    </tr>
  );
}
