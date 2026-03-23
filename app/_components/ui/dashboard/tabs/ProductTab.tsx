"use client";

import {
  adminDeleteProduct,
  getAdminProducts,
} from "@/app/_lib/data-services/admin-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Filter,
  Loader2,
  Package,
  Plus,
  Search,
  Store,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { ProductModal } from "../components/ProductModal";
import { TableActions, buildProductActions } from "../components/TableActions";

export function ProductsTab({ data: initialData }: { data: any[] }) {
  const [data, setData] = useState<any[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");

  // Category Filter State
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Store Filter State
  const [activeStoreFilter, setActiveStoreFilter] = useState("الكل");
  const [isStoreFilterOpen, setIsStoreFilterOpen] = useState(false);
  const storeFilterRef = useRef<HTMLDivElement>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const ITEMS_PER_PAGE = 20;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, activeFilter, activeStoreFilter]);

  // Keep local state in sync with server state (Real-time update fix)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const categories = [
    "الكل",
    ...Array.from(
      new Set(
        data.map((p) => p.category || p.categories?.name).filter(Boolean),
      ),
    ),
  ];

  const stores = [
    "الكل",
    ...Array.from(
      new Set(data.map((p) => p.store || p.stores?.name).filter(Boolean)),
    ),
  ];

  const filteredProducts = data.filter((product) => {
    const productName = product.name || "";
    const storeName = product.store || product.stores?.name || "";
    const productCat = product.category || product.categories?.name || "";
    const productStore = product.store || product.stores?.name || "";

    const matchesSearch =
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategoryFilter =
      activeFilter === "الكل" || productCat === activeFilter;

    const matchesStoreFilter =
      activeStoreFilter === "الكل" || productStore === activeStoreFilter;

    return matchesSearch && matchesCategoryFilter && matchesStoreFilter;
  });

  async function refreshData() {
    setIsRefreshing(true);
    try {
      const updatedProducts = await getAdminProducts();
      setData(updatedProducts);
      router.refresh();
    } catch {
      const updatedProducts = await getAdminProducts();
      setData(updatedProducts);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleEdit(product: any) {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  }

  function handleDeletePrompt(product: any) {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedProduct) return;
    setIsDeleting(true);
    try {
      await adminDeleteProduct(selectedProduct.id);
      toast.success("تم حذف المنتج بنجاح");
      setData((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      setIsRefreshing(true);
      router.refresh();
      const updatedProducts = await getAdminProducts();
      setData(updatedProducts);
    } catch (err: any) {
      toast.error(err.message || "فشل الحذف");
    } finally {
      setIsDeleting(false);
      setIsRefreshing(false);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
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

          {/* Category Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsStoreFilterOpen(false); // Close store filter if open
              }}
              className={`p-3 rounded-2xl cursor-pointer border transition-all ${isFilterOpen ? "bg-marketplace-accent text-white border-marketplace-accent" : "bg-marketplace-bg text-marketplace-text-primary border-marketplace-border"}`}
              title="تصفية حسب الفئة"
            >
              <Filter size={18} />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-48 bg-marketplace-card border border-marketplace-border rounded-2xl shadow-xl overflow-hidden py-2 z-50"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveFilter(cat);
                        setIsFilterOpen(false);
                      }}
                      className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 hover:bg-marketplace-card-hover transition-colors text-right"
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

          {/* Store Filter */}
          <div className="relative" ref={storeFilterRef}>
            <button
              onClick={() => {
                setIsStoreFilterOpen(!isStoreFilterOpen);
                setIsFilterOpen(false); // Close category filter if open
              }}
              className={`p-3 rounded-2xl cursor-pointer border transition-all ${isStoreFilterOpen ? "bg-marketplace-accent text-white border-marketplace-accent" : "bg-marketplace-bg text-marketplace-text-primary border-marketplace-border"}`}
              title="تصفية حسب المتجر"
            >
              <Store size={18} />
            </button>
            <AnimatePresence>
              {isStoreFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-48 bg-marketplace-card border border-marketplace-border rounded-2xl shadow-xl overflow-hidden py-2 z-50"
                >
                  {stores.map((store) => (
                    <button
                      key={store}
                      onClick={() => {
                        setActiveStoreFilter(store);
                        setIsStoreFilterOpen(false);
                      }}
                      className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 hover:bg-marketplace-card-hover transition-colors text-right"
                    >
                      <span
                        className={`text-sm font-bold ${activeStoreFilter === store ? "text-marketplace-accent" : "text-marketplace-text-secondary"}`}
                      >
                        {store}
                      </span>
                      {activeStoreFilter === store && (
                        <Check size={14} className="text-marketplace-accent" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsProductModalOpen(true);
          }}
          className="w-full md:w-auto cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-marketplace-accent text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-marketplace-accent/20"
        >
          <Plus size={18} />
          <span>إضافة منتج</span>
        </button>
      </div>

      <div className="relative bg-marketplace-card rounded-[2.5rem] border border-marketplace-border overflow-hidden shadow-sm">
        {isRefreshing && (
          <div className="absolute inset-0 z-10 bg-marketplace-card/70 backdrop-blur-[2px] flex items-center justify-center rounded-[2.5rem]">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                className="text-marketplace-accent animate-spin"
                size={32}
              />
              <span className="text-xs font-bold text-marketplace-text-secondary">
                جاري تحديث البيانات...
              </span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]">
            <thead>
              <tr className="bg-marketplace-bg/30 border-b border-marketplace-border">
                {[
                  "المنتج",
                  "المتجر",
                  "الفئة",
                  "السعر",
                  "المخزون",
                  "الحالة",
                  "الإجراءات",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest ${i === 6 ? "text-left" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-marketplace-border/50">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDeletePrompt}
                />
              ))}
            </tbody>
          </table>
        </div>
        {visibleCount < filteredProducts.length && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <span className="text-xs text-marketplace-text-secondary font-bold animate-pulse">
              جاري تحميل المزيد...
            </span>
          </div>
        )}
        {filteredProducts.length > 0 && (
          <div className="text-center py-3">
            <span className="text-xs text-marketplace-text-secondary">
              عرض {Math.min(visibleCount, filteredProducts.length)} من{" "}
              {filteredProducts.length}
            </span>
          </div>
        )}
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

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSuccess={refreshData}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="حذف المنتج"
        description={`هل أنت متأكد من حذف منتج "${selectedProduct?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: (p: any) => void;
  onDelete: (p: any) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const actions = buildProductActions(product, onEdit, onDelete);
  const storeName = product.store || product.stores?.name || "—";
  const category = product.category || product.categories?.name || "—";
  const stock = product.stock ?? product.stock_quantity ?? 0;
  const priceDisplay = product.price
    ? `${Number(product.price).toLocaleString("en-US")} د.ع`
    : product.price || "—";
  const statusLabel = product.status
    ? product.status
    : stock > 10
      ? "متوفر"
      : stock > 0
        ? "مخزون منخفض"
        : "نفذ المخزون";

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group hover:bg-marketplace-card-hover transition-all duration-300"
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-text-secondary group-hover:text-marketplace-accent transition-colors">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <Package size={20} />
            )}
          </div>
          <span className="text-marketplace-text-primary font-bold">
            {product.name}
          </span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-secondary text-sm">
          <Store size={14} className="opacity-50" />
          {storeName}
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-secondary text-sm">
          <Tag size={14} className="opacity-50 text-marketplace-accent" />
          <span className="bg-marketplace-bg px-2 py-1 rounded-lg border border-marketplace-border">
            {category}
          </span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="text-marketplace-accent font-black text-lg">
          {priceDisplay}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <span
            className={`text-[10px] font-bold ${stock < 5 ? "text-red-500" : "text-marketplace-text-secondary"}`}
          >
            {stock} قطع
          </span>
          <div className="h-1.5 w-full bg-marketplace-bg rounded-full overflow-hidden border border-marketplace-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stock / 50) * 100, 100)}%` }}
              className={`h-full rounded-full ${stock >= 10 ? "bg-green-500" : stock > 0 ? "bg-yellow-500" : "bg-red-500"}`}
            />
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
            statusLabel === "متوفر"
              ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
              : statusLabel === "مخزون منخفض"
                ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {statusLabel === "متوفر" ? (
            <CheckCircle size={12} />
          ) : (
            <AlertTriangle size={12} />
          )}
          {statusLabel}
        </div>
      </td>
      <td className="px-8 py-5 text-left">
        <TableActions actions={actions} />
      </td>
    </tr>
  );
}
