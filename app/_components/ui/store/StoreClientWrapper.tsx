"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutGrid,
  ArrowRight,
  MapPin,
  Phone,
  Share2,
  Info,
  SlidersHorizontal,
  Settings2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/app/_components/ui/product/ProductCard";
import { ProductModal } from "@/app/_components/ui/product/ProductModal";

export default function StoreClientWrapper({ store, initialProducts }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = useMemo(() => {
    const cats = initialProducts
      .map((p: any) => p.category)
      .filter((c: any) => !!c);
    return ["الكل", ...Array.from(new Set(cats))];
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product: any) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "الكل" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, initialProducts]);

  return (
    <div
      className="min-h-screen bg-marketplace-bg pb-32 selection:bg-marketplace-accent/30 transition-colors duration-500"
      dir="rtl"
    >
      {/* 1. CINEMATIC HERO */}
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            src={store.logo_url}
            className="w-full h-full object-cover blur-[100px] saturate-150"
            alt=""
          />
          {/* Gradient overlay shifts based on theme background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-marketplace-bg/80 to-marketplace-bg" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative group mb-6"
          >
            <div className="absolute -inset-1 bg-marketplace-accent rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-[2.8rem] bg-marketplace-card border border-marketplace-border p-2 shadow-2xl">
              <img
                src={store.logo_url}
                className="w-full h-full object-cover rounded-[2.4rem]"
                alt={store.name}
              />
              <button className="absolute -bottom-2 -right-2 p-2.5 bg-marketplace-accent rounded-2xl text-primary-foreground shadow-xl border border-white/20 hover:scale-110 transition-transform">
                <Settings2 size={16} />
              </button>
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-marketplace-text-primary tracking-tight">
            {store.name}
          </h1>
        </div>

        {/* Floating Top Nav */}
        <div className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
          <Link
            href="/"
            className="p-3 rounded-2xl bg-marketplace-card/50 border border-marketplace-border backdrop-blur-md hover:bg-marketplace-card transition-all text-marketplace-text-primary"
          >
            <ArrowRight />
          </Link>
          <button className="p-3 rounded-2xl bg-marketplace-card/50 border border-marketplace-border backdrop-blur-md hover:bg-marketplace-card transition-all text-marketplace-text-primary">
            <Share2 size={20} />
          </button>
        </div>
      </section>

      {/* 2. ELEGANT INFO STRIP */}
      <div className="container mx-auto px-6 -mt-20 relative z-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-marketplace-card/80 backdrop-blur-2xl border border-marketplace-border rounded-[3rem] p-8 shadow-3xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-marketplace-accent font-bold text-[10px] uppercase tracking-[0.2em]">
                <Info size={14} />
                <span>عن المتجر</span>
              </div>
              <p className="text-marketplace-text-secondary text-lg leading-relaxed font-medium">
                {store.description ||
                  "أهلاً بكم في متجرنا المتميز. نقدم لكم أفضل المنتجات المختارة بعناية."}
              </p>
            </div>
            <div className="flex flex-col gap-5 border-r border-marketplace-border pr-10">
              <ContactItem
                icon={<MapPin size={18} />}
                label="الموقع"
                value={store.address}
              />
              <ContactItem
                icon={<Phone size={18} />}
                label="الهاتف"
                value={store.phone}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. COMMAND BAR WITH DROPDOWN MENU */}
      <div className="sticky top-8 z-40 container mx-auto px-6 mt-16">
        <div className="bg-marketplace-card/80 backdrop-blur-3xl border border-marketplace-border rounded-[2.2rem] p-2 flex items-center gap-2 shadow-2xl">
          {/* Dropdown Container */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-4 rounded-[1.6rem] transition-all border flex items-center gap-2 ${
                isFilterOpen
                  ? "bg-marketplace-accent text-primary-foreground border-marketplace-accent shadow-lg shadow-marketplace-accent/20"
                  : "bg-marketplace-bg text-marketplace-text-primary border-marketplace-border hover:bg-marketplace-card-hover"
              }`}
            >
              <SlidersHorizontal size={22} />
              <span className="hidden md:block text-sm font-bold ml-1">
                تصفية
              </span>
            </button>

            {/* Elegant Dropdown List */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 bg-marketplace-card border border-marketplace-border rounded-[2rem] shadow-3xl overflow-hidden py-3 z-50 backdrop-blur-xl"
                >
                  <div className="px-5 py-2 mb-2 border-b border-marketplace-border">
                    <p className="text-[10px] font-black text-marketplace-text-secondary uppercase tracking-widest">
                      اختر الفئة
                    </p>
                  </div>
                  {categories.map((cat: any) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-marketplace-card-hover transition-colors group"
                    >
                      <span
                        className={`text-sm font-bold ${activeCategory === cat ? "text-marketplace-accent" : "text-marketplace-text-secondary group-hover:text-marketplace-text-primary"}`}
                      >
                        {cat}
                      </span>
                      {activeCategory === cat && (
                        <motion.div
                          layoutId="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check
                            size={16}
                            className="text-marketplace-accent"
                          />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex-1 group">
            <Search
              className="absolute right-5 top-1/2 -translate-y-1/2 text-marketplace-text-secondary group-focus-within:text-marketplace-accent transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="ابحث عن اسم المنتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-marketplace-bg border border-transparent focus:border-marketplace-accent/20 rounded-[1.6rem] py-4 pr-14 pl-6 outline-none text-marketplace-text-primary font-bold transition-all"
            />
          </div>

          {/* Active Filter Indicator */}
          <div className="hidden md:flex px-6 py-3 bg-marketplace-bg border border-marketplace-border rounded-[1.4rem] text-marketplace-text-secondary font-bold text-xs">
            الفئة:{" "}
            <span className="text-marketplace-text-primary mr-1">
              {activeCategory}
            </span>
          </div>
        </div>
      </div>

      {/* 4. PRODUCT GRID */}
      <main className="container mx-auto px-6 mt-24">
        <div className="flex items-center justify-between mb-12 border-b border-marketplace-border pb-6">
          <h2 className="text-3xl font-black text-marketplace-text-primary flex items-center gap-4">
            <LayoutGrid className="text-marketplace-accent" size={28} />
            المنتجات
          </h2>
          <span className="px-4 py-2 bg-marketplace-card border border-marketplace-border text-marketplace-text-secondary rounded-full text-xs font-bold">
            {filteredProducts.length} متوفر
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product: any) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

function ContactItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-12 h-12 rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-accent group-hover:bg-marketplace-accent group-hover:text-primary-foreground transition-all duration-300 shadow-inner">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[10px] text-marketplace-text-secondary font-bold uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm text-marketplace-text-primary font-bold truncate max-w-[150px]">
          {value || "غير متوفر"}
        </p>
      </div>
    </div>
  );
}
