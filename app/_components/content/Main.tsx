"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  PackageSearch,
} from "lucide-react";
import { StoreCard } from "../ui/store/StoreCard";
import { Hero } from "./Hero";
import Footer from "./Footer";
import Link from "next/link";
import { getStores, getCategories } from "@/app/_lib/data-service";

export default function Main() {
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const [storesData, categoriesData] = await Promise.all([
          getStores(),
          getCategories(),
        ]);
        setStores(storesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || store.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-marketplace-bg min-h-screen">
      <Hero />

      <main dir="rtl" className="max-w-7xl mx-auto px-6 py-16">
        {/* Advanced Filter & Search Bar Layout */}
        <section className="sticky top-4 z-40 mb-16">
          <div className="bg-marketplace-card/80 backdrop-blur-2xl border border-border/50 p-3 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-3">
            {/* Search Input Group */}
            <div className="relative flex-1 group">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-marketplace-accent transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم المتجر..."
                className="w-full bg-marketplace-bg border-none rounded-2xl pr-14 pl-4 py-4 outline-none text-marketplace-text-primary focus:ring-2 focus:ring-marketplace-accent/20 transition-all"
              />
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 px-2 scrollbar-hide">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-6 py-3.5 rounded-xl whitespace-nowrap font-bold text-sm transition-all ${
                  activeCategory === "all"
                    ? "bg-marketplace-accent text-white shadow-lg shadow-marketplace-accent/20"
                    : "bg-marketplace-bg text-marketplace-text-secondary hover:bg-muted"
                }`}
              >
                الكل
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3.5 rounded-xl whitespace-nowrap font-bold text-sm transition-all ${
                    activeCategory === cat.id
                      ? "bg-marketplace-accent text-white shadow-lg shadow-marketplace-accent/20"
                      : "bg-marketplace-bg text-marketplace-text-secondary hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Filter Icon Button (Visual Only) */}
            <button className="hidden lg:flex items-center justify-center p-4 bg-marketplace-bg border border-border/50 rounded-2xl text-marketplace-text-secondary hover:text-marketplace-accent transition-colors">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </section>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-10 px-2">
          <h2 className="text-2xl font-bold text-marketplace-text-primary">
            {activeCategory === "all" ? "المتاجر المتاحة" : "نتائج البحث"}
            <span className="text-sm font-normal text-marketplace-text-secondary mr-3 opacity-60">
              ({filteredStores.length} متجر)
            </span>
          </h2>
        </div>

        {/* Dynamic Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-[320px] bg-marketplace-card/40 animate-pulse rounded-3xl border border-border/20"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={`/store/${store.slug || store.id}`}
                    className="block group"
                  >
                    <StoreCard store={store} />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Elegant Empty State */}
        {!loading && filteredStores.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <PackageSearch size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-marketplace-text-primary mb-2">
              لا يوجد نتائج
            </h3>
            <p className="text-marketplace-text-secondary">
              حاول تغيير معايير البحث أو الفئة المختارة
            </p>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
