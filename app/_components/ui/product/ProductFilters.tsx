"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  DollarSign,
  Package,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SORT_OPTIONS = [
  { id: "relevant", label: "الافتراضي", icon: Zap },
  { id: "newest", label: "الأحدث", icon: Clock },
  { id: "oldest", label: "الأقدم", icon: Clock },
  { id: "price-low", label: "سعر تصاعدي", icon: ArrowUp },
  { id: "price-high", label: "سعر تنازلي", icon: ArrowDown },
];

const STOCK_OPTIONS = [
  { id: "all", label: "الكل", color: "" },
  { id: "in-stock", label: "متوفر", color: "green" },
  { id: "low-stock", label: "كمية محدودة", color: "amber" },
  { id: "out-of-stock", label: "نفد المخزون", color: "red" },
];

interface ProductFiltersProps {
  products: any[];
  onFiltered: (filtered: any[]) => void;
}

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={13} className="text-marketplace-accent shrink-0" />
      <span className="text-[11px] font-black uppercase tracking-widest text-marketplace-text-secondary">
        {label}
      </span>
    </div>
  );
}

export default function ProductFilters({
  products,
  onFiltered,
}: ProductFiltersProps) {
  const [selectedSort, setSelectedSort] = useState("relevant");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState("all");
  const [isPriceExpanded, setIsPriceExpanded] = useState(false);

  const maxPrice = useMemo(() => {
    if (!products.length) return 0;
    return Math.max(...products.map((p) => p.price ?? 0));
  }, [products]);

  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      const name = p.categories?.name ?? p.category ?? null;
      if (name) map[name] = (map[name] ?? 0) + 1;
    }
    return map;
  }, [products]);

  const uniqueCategories = useMemo(
    () => Object.keys(categoryMap).sort(),
    [categoryMap],
  );

  useEffect(() => {
    if (maxPrice > 0) setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  useEffect(() => {
    let result = [...products];

    result = result.filter(
      (p) => (p.price ?? 0) >= priceRange[0] && (p.price ?? 0) <= priceRange[1],
    );

    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        const catName = p.categories?.name ?? p.category ?? null;
        return catName && selectedCategories.includes(catName);
      });
    }

    if (selectedStock !== "all") {
      result = result.filter((p) => {
        const qty = p.stock_quantity ?? 0;
        if (selectedStock === "in-stock") return qty > 5;
        if (selectedStock === "low-stock") return qty > 0 && qty <= 5;
        if (selectedStock === "out-of-stock") return qty <= 0;
        return true;
      });
    }

    switch (selectedSort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime(),
        );
        break;
      case "price-low":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
    }

    onFiltered(result);
  }, [
    products,
    priceRange,
    selectedCategories,
    selectedStock,
    selectedSort,
    onFiltered,
  ]);

  const isPriceActive =
    maxPrice > 0 && (priceRange[0] > 0 || priceRange[1] < maxPrice);

  const activeCount =
    (selectedSort !== "relevant" ? 1 : 0) +
    selectedCategories.length +
    (selectedStock !== "all" ? 1 : 0) +
    (isPriceActive ? 1 : 0);

  const resetAll = () => {
    setSelectedSort("relevant");
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
    setSelectedStock("all");
  };

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const pillBase =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer border select-none";
  const pillActive =
    "bg-marketplace-accent text-white border-marketplace-accent shadow-md shadow-marketplace-accent/25 scale-[1.02]";
  const pillIdle =
    "bg-marketplace-bg border-marketplace-border text-marketplace-text-secondary hover:border-marketplace-accent/50 hover:text-marketplace-accent";

  const stockPillActive: Record<string, string> = {
    all: pillActive,
    "in-stock":
      "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20 scale-[1.02]",
    "low-stock":
      "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]",
    "out-of-stock":
      "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20 scale-[1.02]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-marketplace-card/60 backdrop-blur-xl border border-marketplace-border rounded-2xl overflow-hidden shadow-sm"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 bg-marketplace-bg/30 border-b border-marketplace-border/50">
        <div className="flex items-center gap-2.5 font-bold text-marketplace-text-primary">
          <div className="p-1.5 rounded-lg bg-marketplace-accent/10">
            <SlidersHorizontal size={15} className="text-marketplace-accent" />
          </div>
          <span>تصفية المنتجات</span>
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-marketplace-accent text-white text-[11px] font-black px-2 py-0.5 rounded-full min-w-5 text-center"
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={resetAll}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-marketplace-border text-marketplace-text-secondary hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>مسح الكل</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-6">
        {/* Sort + Stock on desktop: side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Sort ── */}
          <div>
            <SectionLabel icon={Zap} label="ترتيب حسب" />
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedSort(id)}
                  className={`${pillBase} ${selectedSort === id ? pillActive : pillIdle}`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stock Status ── */}
          <div>
            <SectionLabel icon={Package} label="حالة المخزون" />
            <div className="flex flex-wrap gap-2">
              {STOCK_OPTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedStock(id)}
                  className={`${pillBase} ${
                    selectedStock === id
                      ? (stockPillActive[id] ?? pillActive)
                      : pillIdle
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Categories ── */}
        {uniqueCategories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag size={13} className="text-marketplace-accent shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-widest text-marketplace-text-secondary">
                  الفئات
                </span>
              </div>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-[11px] font-bold text-marketplace-text-secondary hover:text-destructive transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw size={11} />
                  مسح الفئات
                </button>
              )}
            </div>

            {/* Horizontal scroll on mobile, wrap on desktop */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible scrollbar-hide">
              {/* "الكل" pill */}
              <button
                onClick={() => setSelectedCategories([])}
                className={`${pillBase} shrink-0 ${
                  selectedCategories.length === 0 ? pillActive : pillIdle
                }`}
              >
                الكل
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    selectedCategories.length === 0
                      ? "bg-white/20 text-white"
                      : "bg-marketplace-accent/10 text-marketplace-accent"
                  }`}
                >
                  {products.length}
                </span>
              </button>

              {uniqueCategories.map((cat) => {
                const isActive = selectedCategories.includes(cat);
                const count = categoryMap[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`${pillBase} shrink-0 ${isActive ? pillActive : pillIdle}`}
                  >
                    <Tag size={12} className={isActive ? "opacity-80" : "opacity-50"} />
                    {cat}
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-marketplace-accent/10 text-marketplace-accent"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Price Range ── */}
        {maxPrice > 0 && (
          <div className="rounded-xl border border-marketplace-border overflow-hidden">
            {/* Toggle trigger */}
            <button
              onClick={() => setIsPriceExpanded((v) => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer group ${
                isPriceExpanded
                  ? "bg-marketplace-accent/10 border-b border-marketplace-border"
                  : "bg-marketplace-bg/50 hover:bg-marketplace-bg"
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign
                  size={14}
                  className={`transition-colors ${isPriceExpanded ? "text-marketplace-accent" : "text-marketplace-text-secondary group-hover:text-marketplace-accent"}`}
                />
                <span
                  className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isPriceExpanded ? "text-marketplace-accent" : "text-marketplace-text-secondary group-hover:text-marketplace-accent"}`}
                >
                  نطاق السعر
                </span>
                {isPriceActive && (
                  <span className="bg-marketplace-accent/15 text-marketplace-accent text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    مُعدَّل
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-marketplace-accent hidden sm:block">
                  من {priceRange[0].toLocaleString("en-US")} إلى{" "}
                  {priceRange[1].toLocaleString("en-US")} د.ع
                </span>
                <motion.div
                  animate={{ rotate: isPriceExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={16}
                    className={`transition-colors ${isPriceExpanded ? "text-marketplace-accent" : "text-marketplace-text-secondary group-hover:text-marketplace-accent"}`}
                  />
                </motion.div>
              </div>
            </button>

            {/* Expandable content */}
            <AnimatePresence initial={false}>
              {isPriceExpanded && (
                <motion.div
                  key="price-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    dir="rtl"
                    className="px-4 py-5 bg-marketplace-bg/30 space-y-5"
                  >
                    {/* Responsive text header for mobile viewports */}
                    <p className="text-center text-sm font-bold text-marketplace-accent sm:hidden">
                      من {priceRange[0].toLocaleString("en-US")} إلى{" "}
                      {priceRange[1].toLocaleString("en-US")} د.ع
                    </p>

                    {/* Slider Section */}
                    {/* FIXED: dir="ltr" forces standard left-to-right slider layout (0 on left, Max on right) */}
                    <div dir="ltr" className="px-1">
                      <input
                        type="range"
                        min={0}
                        max={maxPrice}
                        value={
                          priceRange[0]
                        } /* FIXED: Changes the 'من' minimum price limit */
                        onChange={(e) =>
                          setPriceRange([
                            Math.min(Number(e.target.value), priceRange[1]),
                            priceRange[1],
                          ])
                        }
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-marketplace-accent bg-marketplace-border/40 outline-none"
                        style={{
                          /* FIXED: Left side of thumb (0 to current value) is dark gray, right side running to max limit fills with your accent color */
                          background: `linear-gradient(to right, #374151 ${(priceRange[0] / maxPrice) * 100}%, var(--color-marketplace-accent, #3c48b4) ${(priceRange[0] / maxPrice) * 100}%)`,
                        }}
                      />
                      {/* Scale labels match the left-to-right orientation */}
                      <div className="flex justify-between text-[10px] text-marketplace-text-secondary mt-1.5 font-semibold">
                        <span>0 د.ع</span>
                        <span>{maxPrice.toLocaleString("en-US")} د.ع</span>
                      </div>
                    </div>

                    {/* Numeric Input Boxes Grid */}
                    <div className="flex items-center gap-3 pt-1">
                      {/* Field Box: من */}
                      <div className="flex-1 relative">
                        {/* FIXED: Micro-adjusted position and added background masking so the label clips the border elegantly */}
                        <label className="absolute -top-4.5 right-0.5 text-[10px]  backdrop-blur-sm px-1.5 text-marketplace-text-secondary font-black tracking-wide z-10 rounded">
                          من
                        </label>
                        {/* Clean input card container containing both input field and its currency unit */}
                        <div className="flex items-center bg-marketplace-bg border border-marketplace-border rounded-xl focus-within:border-marketplace-accent/60 transition-all duration-200 px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={maxPrice}
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([
                                Math.min(Number(e.target.value), priceRange[1]),
                                priceRange[1],
                              ])
                            }
                            /* FIXED: Completely eliminated native browser spin arrow buttons across Chrome, Safari, and Firefox */
                            className="w-full bg-transparent text-center text-sm font-bold text-marketplace-text-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs text-marketplace-text-secondary font-bold mr-1 select-none">
                            د.ع
                          </span>
                        </div>
                      </div>

                      <div className="text-marketplace-text-secondary font-bold text-base self-center px-0.5">
                        —
                      </div>

                      {/* Field Box: إلى */}
                      <div className="flex-1 relative">
                        <label className="absolute -top-4.5 right-0.5 text-[10px] backdrop-blur-sm px-1.5 text-marketplace-text-secondary font-black tracking-wide z-10 rounded">
                          إلى
                        </label>
                        <div className="flex items-center bg-marketplace-bg border border-marketplace-border rounded-xl focus-within:border-marketplace-accent/60 transition-all duration-200 px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([
                                priceRange[0],
                                Math.max(Number(e.target.value), priceRange[0]),
                              ])
                            }
                            className="w-full bg-transparent text-center text-sm font-bold text-marketplace-text-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs text-marketplace-text-secondary font-bold mr-1 select-none">
                            د.ع
                          </span>
                        </div>
                      </div>
                    </div>

                    {isPriceActive && (
                      <button
                        onClick={() => setPriceRange([0, maxPrice])}
                        className="text-xs text-marketplace-text-secondary hover:text-destructive transition-colors cursor-pointer flex items-center gap-1 pt-1"
                      >
                        <RotateCcw size={11} />
                        إعادة ضبط السعر
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
