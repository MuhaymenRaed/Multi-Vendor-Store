"use client";

import { getUser } from "@/app/_lib/data-services/auth-service";
import { getStores } from "@/app/_lib/data-services/store-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  LayoutGrid,
  PackageSearch,
  Search,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StoreCard } from "../ui/store/StoreCard";
import Footer from "./Footer";
import { Hero } from "./Hero";

const FILTER_OPTIONS = [
  { id: "all", label: "الكل", icon: LayoutGrid },
  { id: "newest", label: "الأحدث", icon: Clock },
  { id: "popular", label: "الأكثر شعبية", icon: Star },
];

export default function Main() {
  const [stores, setStores] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); // Track signed-in user
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Get the current user session
        const user = await getUser();
        setCurrentUser(user);

        // 2. Fetch stores (passing userId to handle bubbling logic)
        const storesData = await getStores(activeSort, user?.id);
        setStores(storesData);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeSort]);

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-marketplace-bg min-h-screen">
      <Hero />

      <main dir="rtl" className="max-w-7xl mx-auto px-6 py-16">
        <section className="sticky top-4 z-40 mb-16">
          <div className="bg-marketplace-card/80 backdrop-blur-2xl border border-border/50 p-3 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-3">
            {/* Search Input */}
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

            {/* Standard Filters Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center cursor-pointer justify-between gap-3 px-6 py-4 bg-marketplace-accent rounded-2xl text-white font-bold min-w-[180px] shadow-lg shadow-marketplace-accent/20 transition-transform active:scale-95"
              >
                <span>
                  {FILTER_OPTIONS.find((f) => f.id === activeSort)?.label}
                </span>
                <ChevronDown
                  className={`transition-transform duration-300  ${isFilterOpen ? "rotate-180" : ""}`}
                  size={18}
                />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-marketplace-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 min-w-[200px]"
                  >
                    {FILTER_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setActiveSort(option.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                            activeSort === option.id
                              ? "bg-marketplace-accent/10 text-marketplace-accent"
                              : "hover:bg-muted text-marketplace-text-secondary"
                          } cursor-pointer`}
                        >
                          <Icon size={18} />
                          <span className="font-bold">{option.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-10 px-2">
          <h2 className="text-2xl font-bold text-marketplace-text-primary">
            {FILTER_OPTIONS.find((f) => f.id === activeSort)?.label}
            <span className="text-sm font-normal text-marketplace-text-secondary mr-3 opacity-60">
              ({filteredStores.length} متجر)
            </span>
          </h2>
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] bg-marketplace-card/40 animate-pulse rounded-3xl border border-border/20"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredStores.map((store, index) => {
                // Determine if this is the logged-in seller's store
                const isMyStore = currentUser?.id === store.owner_id;

                return (
                  <motion.div
                    key={store.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative h-full"
                  >
                    <Link
                      href={`/store/${store.slug || store.id}`}
                      className={`block h-full group rounded-3xl transition-all duration-500 ${
                        isMyStore
                          ? "ring-2 ring-marketplace-accent ring-offset-4 ring-offset-marketplace-bg shadow-xl shadow-marketplace-accent/10"
                          : ""
                      }`}
                    >
                      {/* Special Indicator for My Store */}
                      {isMyStore && (
                        <div className="absolute -top-3 -right-2 z-10 bg-marketplace-accent text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg border-2 border-marketplace-bg animate-bounce-slow">
                          <User size={12} />
                        </div>
                      )}

                      <div
                        className={`h-full rounded-3xl transition-all duration-300 ${
                          isMyStore
                            ? "border-2 border-marketplace-accent/50"
                            : "border border-transparent"
                        }`}
                      >
                        <StoreCard store={store} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredStores.length === 0 && (
          <motion.div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <PackageSearch size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-marketplace-text-primary mb-2">
              لا يوجد نتائج
            </h3>
            <p className="text-marketplace-text-secondary">
              جرب استخدام كلمات بحث مختلفة
            </p>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
