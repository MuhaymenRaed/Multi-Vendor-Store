"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SearchBar } from "../reuseable/SearchBar";
import { Filters } from "../reuseable/Filters";
import { StoreCard } from "../ui/store/StoreCard";
import { Hero } from "./Hero";
import Footer from "./Footer";
import Link from "next/link";
import { getStores, getCategories } from "@/app/_lib/data-service"; // Use your service

export default function Main() {
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  // 1. Fetch live data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [storesData, categoriesData] = await Promise.all([
          getStores(),
          getCategories(),
        ]);
        setStores(storesData);
        // Map categories to just names for the Filter component if needed
        setCategories(categoriesData.map((c: any) => c.name));
      } catch (error) {
        console.error("Error loading marketplace data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Filter Logic (Now running on live state)
  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      );

    const matchesCategory =
      activeCategory === "all" || store.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // 3. Sort Logic
  const sortedStores = [...filteredStores].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  return (
    <>
      <Hero />
      <main
        dir="rtl"
        className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Search Section */}
          <div className="mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="البحث عن المتاجر، المنتجات أو الفئات..."
            />
          </div>

          {/* Filters Section */}
          <div id="stores" className="mb-12">
            <Filters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              categories={categories}
            />
          </div>

          {/* Stores Grid Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[var(--marketplace-text-primary)] tracking-tight text-right flex items-center">
                {activeCategory === "all"
                  ? "جميع المتاجر"
                  : `متاجر ${activeCategory}`}
                <span className="text-[var(--marketplace-text-secondary)] mr-3 text-lg font-normal">
                  ({sortedStores.length})
                </span>
              </h2>
            </div>

            {loading ? (
              // Simple Loading Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-64 bg-gray-200/10 animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedStores.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    {/* Using Slug for SEO-friendly URLs if available, otherwise ID */}
                    <Link href={`/store/${store.slug || store.id}`}>
                      <StoreCard store={store} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && sortedStores.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 border-2 border-dashed border-[var(--border)] rounded-2xl"
              >
                <p className="text-[var(--marketplace-text-secondary)] text-lg">
                  لم يتم العثور على متاجر تطابق معاييرك
                </p>
              </motion.div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
