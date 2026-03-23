"use client";

import {
  adminDeleteStore,
  getAdminStores,
  adminToggleStoreActive,
  getAvailableOwners,
} from "@/app/_lib/data-services/admin-service";
import { supabase } from "@/app/_lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Filter,
  Package,
  Plus,
  Search,
  Store,
  TrendingUp,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { StoreModal } from "../components/StoreModal";
import { TableActions, buildStoreActions } from "../components/TableActions";
// import { getAdminStores } from "@/app/_lib/data-services/dashboard-service";
import { toast } from "react-hot-toast";

export function StoresTab({
  data: initialData,
  adminStoreData: _storeData,
  sideData: subData,
}: {
  data: any[];
  adminStoreData: any;
  sideData: any;
}) {
  const [data, setData] = useState<any[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  async function fetchOwners() {
    try {
      const data = await getAvailableOwners();
      setOwners(data);
    } catch (error) {
      console.error("Failed to fetch owners:", error);
    }
  }
  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-stores-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stores" },
        async () => {
          await refreshData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

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
  }, [searchQuery, activeFilter]);

  const statuses = ["الكل", "نشط", "معطل"];
  const filteredStores = data.filter((store) => {
    // تم تحديث المتغيرات لتتوافق مع الـ Mapping الجديد
    const matchesSearch =
      (store.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.dealerName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const storeStatus = store.isActive ? "نشط" : "معطل";
    const matchesFilter =
      activeFilter === "الكل" || storeStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  async function refreshData() {
    try {
      const stores = await getAdminStores();
      const mappedStores = stores.map((store: any) => ({
        id: store.id,
        name: store.name,
        ownerId: store.owner_id,
        dealerName: store.dealer_name,
        productCount: store.product_count,
        totalRevenue: store.total_revenue,
        slug: store.slug,
        phone: store.phone,
        description: store.description,
        isActive: store.is_active,
        createdAt: store.created_at,
        monthlyHostingFee: store.monthly_hosting_fee,
        commissionFeePerSale: store.commission_fee_per_sale,
        address: store.address,
        logoUrl: store.logo_url,
        isOfficial: store.is_official,
      }));
      setData(mappedStores);
    } catch (err) {
      console.error("Failed to refresh stores:", err);
    }
  }

  function handleEdit(store: any) {
    setSelectedStore(store);
    setIsStoreModalOpen(true);
  }

  function handleDeletePrompt(store: any) {
    setSelectedStore(store);
    setIsDeleteModalOpen(true);
  }

  async function handleToggleActive(store: any) {
    try {
      await adminToggleStoreActive(store.id, !store.isActive);
      toast.success(store.isActive ? "تم تعطيل المتجر" : "تم تفعيل المتجر");
      setData((prev) =>
        prev.map((s) =>
          s.id === store.id ? { ...s, isActive: !s.isActive } : s,
        ),
      );
    } catch (err: any) {
      toast.error(err.message || "فشل التحديث");
    }
  }

  async function handleDeleteConfirm() {
    if (!selectedStore) return;
    setIsDeleting(true);
    try {
      await adminDeleteStore(selectedStore.id);
      toast.success("تم حذف المتجر بنجاح");
      setData((prev) => prev.filter((s) => s.id !== selectedStore.id));
      setIsDeleteModalOpen(false);
      setSelectedStore(null);
    } catch (err: any) {
      toast.error(err.message || "فشل الحذف");
    } finally {
      setIsDeleting(false);
    }
  }

  // ... (الـ Header UI لم يتغير، لذلك نختصره أو نبقيه كما هو)
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header UI */}
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
              className={`p-3 rounded-2xl cursor-pointer border transition-all ${isFilterOpen ? "bg-marketplace-accent text-white border-marketplace-accent" : "bg-marketplace-bg text-marketplace-text-primary border-marketplace-border"}`}
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
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setActiveFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 hover:bg-marketplace-card-hover transition-colors"
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

        <button
          onClick={() => {
            setSelectedStore(null);
            setIsStoreModalOpen(true);
          }}
          className="w-full cursor-pointer md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-marketplace-accent text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-marketplace-accent/20"
        >
          <Plus size={18} />
          <span>إضافة متجر</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-marketplace-card rounded-[2.5rem] border border-marketplace-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[1000px]">
            <thead>
              <tr className="bg-marketplace-bg/30 border-b border-marketplace-border">
                {[
                  "المتجر",
                  "التاجر المسجل",
                  "المخزون",
                  "إجمالي الإيرادات",
                  "الحالة",
                  "الإجراءات",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest ${i === 5 ? "text-left" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-marketplace-border/50">
              {filteredStores.slice(0, visibleCount).map((store) => (
                <StoreRow
                  key={store.id}
                  store={store}
                  owners={owners}
                  sub={subData.find((s: any) => s.id === store.id) || {}}
                  onEdit={handleEdit}
                  onDelete={handleDeletePrompt}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </tbody>
          </table>
        </div>
        {visibleCount < filteredStores.length && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <span className="text-xs text-marketplace-text-secondary font-bold animate-pulse">
              جاري تحميل المزيد...
            </span>
          </div>
        )}
        {filteredStores.length > 0 && (
          <div className="text-center py-3">
            <span className="text-xs text-marketplace-text-secondary">
              عرض {Math.min(visibleCount, filteredStores.length)} من{" "}
              {filteredStores.length}
            </span>
          </div>
        )}
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

      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        store={selectedStore}
        onSuccess={refreshData}
        profiles={owners}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="حذف المتجر"
        description={`هل أنت متأكد من حذف متجر "${selectedStore?.name}"؟`}
        isLoading={isDeleting}
      />
    </div>
  );
}

// StoreRow المحدث ليتعامل مع متغيرات camelCase الجديدة
function StoreRow({
  store,
  onEdit,
  onDelete,
  onToggleActive,
  sub,
  owners,
}: any) {
  const actions = buildStoreActions(store, onEdit, onDelete, onToggleActive);

  // استخدام المتغيرات الجديدة من المابينغ
  const ownerName =
    store.dealerName ||
    owners?.find((owner: any) => owner.id === store.ownerId)?.full_name ||
    "—";
  const revenue = sub.revenue
    ? `${parseInt(sub.revenue).toLocaleString("en-US")} د.ع`
    : "0 د.ع";
  const productsCount = sub.products ?? 0;

  return (
    <tr className="group hover:bg-marketplace-card-hover transition-all duration-300">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-12 h-12 rounded-2xl object-cover border border-marketplace-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-marketplace-accent/10 border border-marketplace-accent/20 flex items-center justify-center text-marketplace-accent">
              <Store size={22} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-marketplace-text-primary font-bold text-base flex items-center gap-1.5">
              {store.name}
            </span>
            {store.slug && (
              <span
                className="text-marketplace-text-secondary text-xs"
                dir="ltr"
              >
                @{store.slug}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-primary font-bold">
          <User size={14} className="text-marketplace-text-secondary" />
          {ownerName}
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-primary font-bold">
          <Package size={14} className="text-marketplace-text-secondary" />
          {productsCount} منتج
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-accent font-black">
          <TrendingUp size={14} />
          {revenue}
        </div>
      </td>

      <td className="px-8 py-5">
        <span
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${store.isActive ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400" : "bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"}`}
        >
          {store.isActive ? "نشط" : "معطل"}
        </span>
      </td>

      <td className="px-8 py-5 text-left">
        <TableActions actions={actions} />
      </td>
    </tr>
  );
}
