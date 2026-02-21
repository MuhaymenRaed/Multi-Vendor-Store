"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Store,
  Plus,
  User,
  Package,
  TrendingUp,
  Filter,
  Check,
} from "lucide-react";
import { TableActions, storeActions } from "../components/TableActions";

interface StoresTabProps {
  data: {
    id: string | number;
    name: string;
    dealer: string;
    products: number;
    revenue: string;
    status: string;
  }[];
}

export function StoresTab({ data }: StoresTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const statuses = ["الكل", ...Array.from(new Set(data.map((s) => s.status)))];

  const filteredStores = data.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.dealer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "الكل" || store.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. RESPONSIVE COMMAND BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-marketplace-card p-4 rounded-[2rem] border border-marketplace-border shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary group-focus-within:text-marketplace-accent transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="ابحث عن متجر أو تاجر..."
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
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setActiveFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-marketplace-card-hover transition-colors"
                    >
                      <span
                        className={`text-sm font-bold ${activeFilter === status ? "text-marketplace-accent" : "text-marketplace-text-secondary"}`}
                      >
                        {status}
                      </span>
                      {activeFilter === status && (
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
          <span>إضافة متجر</span>
        </button>
      </div>

      {/* 2. STORES TABLE */}
      <div className="bg-marketplace-card rounded-[2.5rem] border border-marketplace-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]">
            <thead>
              <tr className="bg-marketplace-bg/30 border-b border-marketplace-border">
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  المتجر
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  التاجر المسجل
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  المخزون
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  إجمالي الإيرادات
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
              {filteredStores.map((store) => (
                <StoreRow key={store.id} store={store} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredStores.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-marketplace-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-marketplace-border text-marketplace-text-secondary opacity-20">
              <Store size={32} />
            </div>
            <p className="text-marketplace-text-secondary font-bold">
              لا توجد متاجر تطابق بحثك
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreRow({ store }: { store: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group hover:bg-marketplace-card-hover transition-all duration-300"
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-marketplace-accent/10 border border-marketplace-accent/20 flex items-center justify-center text-marketplace-accent group-hover:scale-110 transition-transform">
            <Store size={22} />
          </div>
          <span className="text-marketplace-text-primary font-bold text-base">
            {store.name}
          </span>
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-secondary font-medium">
          <User size={14} className="opacity-50" />
          {store.dealer}
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-primary">
          <Package size={14} className="text-marketplace-text-secondary" />
          <span className="font-bold">{store.products}</span>
          <span className="text-xs text-marketplace-text-secondary">منتج</span>
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
            <TrendingUp size={14} />
          </div>
          <span className="text-marketplace-accent font-black">
            {store.revenue}
          </span>
        </div>
      </td>

      <td className="px-8 py-5">
        <span
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-colors ${
            store.status === "نشط"
              ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
              : "bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
          }`}
        >
          {store.status}
        </span>
      </td>

      <td className="px-8 py-5 text-left">
        <TableActions isHovered={isHovered} actions={storeActions} />
      </td>
    </tr>
  );
}
