"use client";

import {
  addStoreMember,
  getStoreMembers,
  removeStoreMember,
  searchProfiles,
  updateStoreMemberRole,
  type StoreMember,
  type StoreMemberRole,
} from "@/app/_lib/data-services/store-members-service";
import { supabase } from "@/app/_lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

const ROLE_LABELS: Record<StoreMemberRole, string> = {
  co_owner: "مالك مشارك",
  assistant: "مساعد",
};

const ROLE_STYLES: Record<StoreMemberRole, string> = {
  co_owner:
    "bg-marketplace-accent/10 text-marketplace-accent border-marketplace-accent/25",
  assistant:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
};

interface StoreMembersPanelProps {
  storeId: string;
  onClose: () => void;
}

export function StoreMembersPanel({ storeId, onClose }: StoreMembersPanelProps) {
  const [members, setMembers] = useState<StoreMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; full_name: string; email: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStoreMembers(storeId);
      setMembers(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحميل الأعضاء");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, [load]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  // Debounced search — fires on every keystroke and on focus (empty query = recent users)
  const runSearch = useCallback(
    (query: string) => {
      if (searchRef.current) clearTimeout(searchRef.current);
      setSearching(true);
      searchRef.current = setTimeout(async () => {
        try {
          const results = await searchProfiles(query);
          // Only exclude users already in the members list
          const memberIds = new Set(members.map((m) => m.user_id));
          setSearchResults(results.filter((r) => !memberIds.has(r.id)));
        } catch {
          // silently fail
        } finally {
          setSearching(false);
        }
      }, query ? 250 : 0); // instant on focus, debounced on type
    },
    [members, currentUserId],
  );

  useEffect(() => {
    if (isFocused) runSearch(searchQuery);
    else setSearchResults([]);
  }, [searchQuery, isFocused, runSearch]);

  async function handleAdd(user: { id: string; full_name: string; email: string }) {
    if (!currentUserId) return;
    setAddingId(user.id);
    try {
      const member = await addStoreMember(storeId, user.id, "assistant", currentUserId);
      setMembers((prev) => [...prev, member]);
      setSearchQuery("");
      setSearchResults([]);
      toast.success(`تمت إضافة ${user.full_name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الإضافة");
    } finally {
      setAddingId(null);
    }
  }

  async function handleRemove(member: StoreMember) {
    setRemovingId(member.id);
    try {
      await removeStoreMember(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success("تمت الإزالة");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الإزالة");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleRoleChange(memberId: string, role: StoreMemberRole) {
    try {
      await updateStoreMemberRole(memberId, role);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
      );
      toast.success("تم تحديث الدور");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل التحديث");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]"
      />

      {/* Panel */}
      <motion.aside
        dir="rtl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed top-0 left-0 h-full w-full sm:max-w-lg bg-marketplace-card border-l border-marketplace-border shadow-2xl z-120 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-marketplace-border bg-linear-to-l from-blue-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 shrink-0">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-marketplace-text-primary">
                فريق المتجر
              </h2>
              <p className="text-xs text-marketplace-text-secondary font-medium hidden sm:block">
                إضافة مالكين مشاركين ومساعدين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-marketplace-card-hover text-marketplace-text-secondary transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search to invite */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-marketplace-border/50 shrink-0">
          <p className="text-xs font-bold text-marketplace-text-secondary mb-2 uppercase tracking-widest">
            إضافة عضو جديد
          </p>
          <div className="relative">
            <Search
              size={16}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? "text-marketplace-accent" : "text-marketplace-text-secondary/50"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (blurRef.current) clearTimeout(blurRef.current);
                setIsFocused(true);
              }}
              onBlur={() => {
                // Delay so click on a result fires before hiding the dropdown
                blurRef.current = setTimeout(() => setIsFocused(false), 150);
              }}
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              className={`w-full bg-marketplace-bg border rounded-2xl py-3 pr-11 pl-4 text-marketplace-text-primary outline-none transition-all text-sm font-medium ${isFocused ? "border-marketplace-accent/50 shadow-sm shadow-marketplace-accent/10" : "border-marketplace-border"}`}
            />
            {searching && (
              <Loader2
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-marketplace-accent"
              />
            )}
          </div>

          {/* Suggestions / search results dropdown */}
          <AnimatePresence>
            {isFocused && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="mt-2 bg-marketplace-card border border-marketplace-border rounded-2xl overflow-hidden shadow-2xl"
              >
                {!searchQuery && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-black text-marketplace-text-secondary/50 uppercase tracking-widest">
                    مستخدمون حديثون
                  </p>
                )}
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-marketplace-card-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-marketplace-accent/10 flex items-center justify-center text-marketplace-accent text-xs font-black shrink-0">
                        {(user.full_name?.[0] ?? "؟").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-marketplace-text-primary truncate">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-marketplace-text-secondary font-medium truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(user)}
                      disabled={addingId === user.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-marketplace-accent text-white text-xs font-black rounded-xl hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 shrink-0 mr-2"
                    >
                      {addingId === user.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Plus size={12} />
                      )}
                      إضافة
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 cute-scrollbar space-y-2 sm:space-y-3">
          <p className="text-xs font-bold text-marketplace-text-secondary uppercase tracking-widest mb-3">
            الأعضاء الحاليون ({members.length})
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-marketplace-accent" size={28} />
              <p className="text-sm text-marketplace-text-secondary font-bold">جاري التحميل...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <UserCheck size={24} />
              </div>
              <p className="text-marketplace-text-secondary font-bold text-sm">
                لا يوجد أعضاء بعد
              </p>
              <p className="text-marketplace-text-secondary/60 text-xs">
                ابحث عن مستخدم وأضفه للفريق
              </p>
            </div>
          ) : (
            members.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between gap-2 sm:gap-3 bg-marketplace-bg border border-marketplace-border rounded-2xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-marketplace-card-hover flex items-center justify-center text-marketplace-text-secondary shrink-0">
                    <Shield size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-marketplace-text-primary truncate max-w-[100px] sm:max-w-[180px]">
                      {member.profiles?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-marketplace-text-secondary font-medium truncate max-w-[100px] sm:max-w-[180px]">
                      {member.profiles?.email ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Role selector */}
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value as StoreMemberRole)
                    }
                    className={`text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-1 rounded-xl border outline-none cursor-pointer bg-transparent transition-colors max-w-[90px] sm:max-w-none ${ROLE_STYLES[member.role]}`}
                  >
                    {(["assistant", "co_owner"] as StoreMemberRole[]).map((r) => (
                      <option key={r} value={r} className="bg-marketplace-card text-marketplace-text-primary">
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(member)}
                    disabled={removingId === member.id}
                    className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                    title="إزالة العضو"
                  >
                    {removingId === member.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-marketplace-border/50 shrink-0">
          <p className="text-[11px] text-marketplace-text-secondary/60 font-medium leading-relaxed text-center">
            يمكن للمالكين المشاركين والمساعدين إدارة المنتجات وإضافتها.
            <br />
            فقط المالك الرئيسي يستطيع إدارة الخصومات والفريق.
          </p>
        </div>
      </motion.aside>
    </>
  );
}
