"use client";

import { getUser } from "@/app/_lib/data-services/auth-service";
import { getStores } from "@/app/_lib/data-services/store-service";
import { getActiveDiscountsForBanner } from "@/app/_lib/data-services/discount-service";
import { resolveDiscountStatus } from "@/app/_lib/utils/discount-pricing";
import { DISCOUNT_SCOPE_LABELS } from "@/app/_lib/types/discount";
import type { DiscountWithTarget, DiscountScope } from "@/app/_lib/types/discount";
import type { ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  Globe,
  LayoutGrid,
  Package,
  PackageSearch,
  Search,
  Star,
  Store,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StoreCard } from "../ui/store/StoreCard";
import Footer from "./Footer";
import { Hero } from "./Hero";

const FILTER_OPTIONS = [
  { id: "all", label: "الكل", icon: LayoutGrid },
  { id: "popular", label: "الأكثر شعبية", icon: Star },
  { id: "newest", label: "الأحدث", icon: Clock },
  { id: "oldest", label: "الأقدم", icon: Clock },
  { id: "most-products", label: "الأكثر منتجات", icon: LayoutGrid },
];

export default function Main() {
  const [stores, setStores] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); // Track signed-in user
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bannerDiscounts, setBannerDiscounts] = useState<DiscountWithTarget[]>([]);

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

  // Fetch active (+ scheduled) discounts with target names for the banner.
  useEffect(() => {
    getActiveDiscountsForBanner()
      .then(setBannerDiscounts)
      .catch(() => {});
  }, []);

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-marketplace-bg min-h-screen">
      <Hero />

      <main dir="rtl" className="max-w-7xl mx-auto px-6 py-16">
        {/* ── Active / Upcoming Discount Banner ── */}
        <AnimatePresence>
          {bannerDiscounts.length > 0 && (
            <motion.section
              dir="rtl"
              key="discount-banner"
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marketplace-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-marketplace-accent" />
                </span>
                <h3 className="text-sm font-black text-marketplace-text-primary uppercase tracking-widest">
                  عروض وخصومات
                </h3>
                <div className="flex-1 h-px bg-gradient-to-l from-marketplace-accent/30 to-transparent" />
              </div>

              {/* Cards — horizontal scroll on mobile */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {bannerDiscounts.map((d, i) => {
                  const derived = resolveDiscountStatus(d);
                  const isScheduled = derived === "scheduled";

                  // Scope-specific icon + colour palette
                  const scopeConfig: Record<string, { Icon: ElementType; bg: string; iconBg: string; border: string; badge: string }> = {
                    global: {
                      Icon: Globe,
                      bg: "bg-gradient-to-br from-marketplace-accent/15 to-marketplace-accent/5",
                      iconBg: "bg-marketplace-accent",
                      border: "border-marketplace-accent/35",
                      badge: "bg-marketplace-accent text-white",
                    },
                    store: {
                      Icon: Store,
                      bg: "bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/15",
                      iconBg: "bg-blue-500",
                      border: "border-blue-500/30",
                      badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25",
                    },
                    category: {
                      Icon: Tag,
                      bg: "bg-gradient-to-br from-orange-500/10 to-orange-500/5 dark:from-orange-500/15",
                      iconBg: "bg-orange-500",
                      border: "border-orange-500/30",
                      badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25",
                    },
                    product: {
                      Icon: Package,
                      bg: "bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/15",
                      iconBg: "bg-green-500",
                      border: "border-green-500/30",
                      badge: "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/25",
                    },
                  };
                  const cfg = scopeConfig[d.scope] ?? scopeConfig.global;
                  const ScopeIcon = cfg.Icon;

                  // Target label under the name
                  const targetLabel =
                    d.scope === "store" && d.stores
                      ? d.stores.name
                      : d.scope === "category" && d.categories
                        ? d.categories.name
                        : d.scope === "product" && d.products
                          ? d.products.name
                          : d.scope === "global"
                            ? "جميع المنتجات"
                            : null;

                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, scale: 0.9, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex-shrink-0 flex flex-col gap-3 ${cfg.bg} border ${cfg.border} rounded-2xl p-4 min-w-[200px] max-w-[240px] relative overflow-hidden ${isScheduled ? "opacity-75" : ""}`}
                    >
                      {/* Scheduled ribbon */}
                      {isScheduled && d.start_date && (
                        <div className="absolute top-2 left-2 text-[9px] font-black bg-yellow-400/90 text-yellow-900 px-2 py-0.5 rounded-full">
                          يبدأ {new Date(d.start_date).toLocaleDateString("ar", { day: "numeric", month: "short" })}
                        </div>
                      )}

                      {/* Icon + value row */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shadow-lg shrink-0`}>
                          <ScopeIcon size={18} className="text-white" />
                        </div>
                        <div className="text-right leading-none">
                          <p className="text-xl font-black text-marketplace-text-primary">
                            {d.discount_type === "percentage"
                              ? `${d.discount_value}%−`
                              : `${d.discount_value.toLocaleString("en-US")} د.ع−`}
                          </p>
                          <p className="text-[11px] text-marketplace-text-secondary font-semibold mt-0.5 line-clamp-1">
                            {d.name}
                          </p>
                        </div>
                      </div>

                      {/* Target + scope badge row */}
                      <div className="flex items-center justify-between gap-2">
                        {targetLabel && (
                          <span className="text-xs text-marketplace-text-secondary font-medium truncate">
                            {targetLabel}
                          </span>
                        )}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                          {DISCOUNT_SCOPE_LABELS[d.scope as DiscountScope]}
                        </span>
                      </div>

                      {/* Expiry */}
                      {d.end_date && (
                        <p className="text-[10px] text-marketplace-text-secondary/55 font-medium">
                          ينتهي{" "}
                          {new Date(d.end_date).toLocaleDateString("ar", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

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
