"use client";

import {
  adminDeleteUser,
  getAdminUsers,
} from "@/app/_lib/data-services/admin-service";
import { supabase } from "@/app/_lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  Filter,
  Mail,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { TableActions, buildUserActions } from "../components/TableActions";
import { UserModal } from "../components/UserModal";

export function UsersTab({ data: initialData }: { data: any[] }) {
  const [data, setData] = useState<any[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-profiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        async () => {
          try {
            const freshUsers = await getAdminUsers();
            setData(freshUsers);
          } catch (err) {
            console.error("Failed to sync realtime user updates", err);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const roles = [
    "الكل",
    ...Array.from(new Set(data.map((u) => u.role).filter(Boolean))),
  ];

  const filteredUsers = data.filter((user) => {
    if (!user) return false; // Safety check
    if (user.is_deleted) return false;

    const name = (user.full_name || user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = user.phone || "";

    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);

    const matchesFilter = activeFilter === "الكل" || user.role === activeFilter;

    return matchesSearch && matchesFilter;
  });

  async function refreshData() {
    try {
      const fresh = await getAdminUsers();
      setData(fresh);
    } catch (err) {
      console.error("Failed to refresh users", err);
    }
  }

  function handleEdit(user: any) {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  }

  function handleDeletePrompt(user: any) {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      await adminDeleteUser(selectedUser.id);
      toast.success("تم حذف المستخدم بنجاح");

      // Update the local state instead of just removing the user
      setData((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, is_deleted: true } : u,
        ),
      );

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message || "فشل الحذف");
    } finally {
      setIsDeleting(false);
    }
  }
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-marketplace-card p-2.5 rounded-[2.2rem] border border-marketplace-border shadow-sm">
        {/* Main Container - Flex-1 makes this section fill the width */}
        <div className="flex items-center gap-2 w-full flex-1">
          {/* Search Input - flex-1 here ensures it stretches to the very end before the filter */}
          <div className="relative flex-1 group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary group-focus-within:text-marketplace-accent transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="البحث بالاسم، البريد، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-marketplace-bg border border-transparent focus:border-marketplace-accent/20 rounded-[1.5rem] py-3 pr-11 pl-4 outline-none text-marketplace-text-primary font-bold transition-all"
            />
          </div>

          {/* Filter Button - stays at the end */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                isFilterOpen
                  ? "bg-marketplace-accent text-white border-marketplace-accent"
                  : "bg-marketplace-bg text-marketplace-text-primary border-marketplace-border hover:border-marketplace-accent/30"
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
                  className="absolute left-0 mt-3 w-48 bg-marketplace-card border border-marketplace-border rounded-2xl shadow-xl overflow-hidden py-2 z-50"
                >
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setActiveFilter(role);
                        setIsFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-marketplace-card-hover transition-colors cursor-pointer"
                    >
                      <span
                        className={`text-sm font-bold ${activeFilter === role ? "text-marketplace-accent" : "text-marketplace-text-secondary"}`}
                      >
                        {role}
                      </span>
                      {activeFilter === role && (
                        <Check size={14} className="text-marketplace-accent" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="bg-marketplace-card rounded-[2.5rem] border border-marketplace-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead>
              <tr className="bg-marketplace-bg/30 border-b border-marketplace-border">
                {[
                  "المستخدم",
                  "الدور",
                  "الحالة",
                  "تاريخ الانضمام",
                  "الإجراءات",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-8 py-5 text-marketplace-text-secondary font-black text-[14px] uppercase tracking-widest ${i === 4 ? "text-left" : ""} `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-marketplace-border/50">
              {filteredUsers.slice(0, visibleCount).map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDeletePrompt}
                />
              ))}
            </tbody>
          </table>
        </div>
        {visibleCount < filteredUsers.length && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <span className="text-xs text-marketplace-text-secondary font-bold animate-pulse">
              جاري تحميل المزيد...
            </span>
          </div>
        )}
        {filteredUsers.length > 0 && (
          <div className="text-center py-3">
            <span className="text-xs text-marketplace-text-secondary">
              عرض {Math.min(visibleCount, filteredUsers.length)} من{" "}
              {filteredUsers.length}
            </span>
          </div>
        )}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 text-center"
          >
            <div className="w-20 h-20 bg-marketplace-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-marketplace-border">
              <Search
                size={32}
                className="text-marketplace-text-secondary opacity-20"
              />
            </div>
            <h3 className="text-marketplace-text-primary font-bold text-lg">
              لم يتم العثور على نتائج
            </h3>
          </motion.div>
        )}
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        onSuccess={refreshData}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="حذف المستخدم"
        description={`هل أنت متأكد من حذف "${selectedUser?.full_name || selectedUser?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: any;
  onEdit: (u: any) => void;
  onDelete: (u: any) => void;
}) {
  const actions = buildUserActions(user, onEdit, onDelete);

  // 1. Fix naming: Supabase uses full_name, Table might use name
  const displayName = user.full_name || user.name || "—";
  const displayEmail = user.email || "—";
  const displayPhone = user.phone || "-----";

  // 2. Fix naming: Supabase uses created_at, not date
  const rawDate = user.created_at || user.date;
  const displayDate = rawDate
    ? new Date(rawDate).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  // 3. Fix Status: Check for Boolean or the Arabic string "نشط"
  const isActive = user.status === true || user.status === "نشط";
  const displayStatus = isActive ? "نشط" : "غير نشط";

  // 4. Role Translation
  const roleMap: Record<string, string> = {
    seller: "تاجر",
    admin: "مدير",
    guest: "ضيف",
    buyer: "مشتري",
    تاجر: "تاجر", // Handle cases where data is already translated
    مدير: "مدير",
    مشتري: "مشتري",
  };
  const displayRole = roleMap[user.role] || user.role || "مشتري";

  return (
    <tr className="group hover:bg-marketplace-card-hover transition-all duration-300">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-accent font-black text-lg group-hover:scale-110 transition-transform">
            {displayName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-marketplace-text-primary font-bold">
              {displayName}
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-marketplace-text-secondary text-[11px] min-w-0">
                <Mail size={12} className="opacity-70 shrink-0" />
                <span className="truncate">{displayEmail}</span>
              </div>
              <div className="flex items-center gap-1.5 text-marketplace-accent text-[11px] font-medium">
                <Phone size={11} className="opacity-70" />
                <span>{displayPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
            user.role === "seller" || user.role === "تاجر"
              ? "bg-marketplace-accent/5 border-marketplace-accent/20 text-marketplace-accent"
              : user.role === "admin" || user.role === "مدير"
                ? "bg-purple-500/5 border-purple-500/20 text-purple-500"
                : "bg-primary/5 border-primary/20 text-marketplace-text-primary"
          }`}
        >
          <ShieldCheck size={12} />
          {displayRole}
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          {/* Dynamic dot color based on status */}
          <div
            className={`w-2 h-2 rounded-full ${isActive ? "animate-pulse bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-gray-400"}`}
          />
          <span className="text-sm font-bold text-marketplace-text-primary">
            {displayStatus}
          </span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-secondary text-sm font-medium">
          <Calendar size={14} />
          {displayDate}
        </div>
      </td>
      <td className="px-8 py-5 text-left">
        <TableActions actions={actions} />
      </td>
    </tr>
  );
}
