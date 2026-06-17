"use client";

import {
  createCategory,
  deleteCategory,
  getCategoriesForSelect,
} from "@/app/_lib/data-services/admin-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface Category {
  id: number;
  name: string;
}

interface CategorySelectProps {
  value: string;           // category_id as string (empty = none)
  onChange: (id: string) => void;
  isAdmin?: boolean;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  isAdmin = false,
  disabled = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showAddInput, setShowAddInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => String(c.id) === String(value));

  // Load categories on mount
  useEffect(() => {
    getCategoriesForSelect()
      .then(setCategories)
      .catch(() => toast.error("فشل تحميل الفئات"));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowAddInput(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus the input when it appears
  useEffect(() => {
    if (showAddInput) inputRef.current?.focus();
  }, [showAddInput]);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("الفئة موجودة مسبقاً");
      return;
    }
    setIsAdding(true);
    try {
      const created = await createCategory(trimmed);
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(String(created.id));
      setNewName("");
      setShowAddInput(false);
      toast.success(`تمت إضافة فئة "${created.name}"`);
    } catch (err: any) {
      toast.error(err.message || "فشل إضافة الفئة");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      if (String(cat.id) === String(value)) onChange("");
      toast.success(`تم حذف فئة "${cat.name}"`);
    } catch (err: any) {
      toast.error(err.message || "فشل حذف الفئة");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((v) => !v)}
        className={`w-full flex items-center justify-between bg-marketplace-bg border rounded-2xl py-3.5 pr-11 pl-4 text-marketplace-text-primary font-bold outline-none transition-all cursor-pointer ${
          isOpen
            ? "border-marketplace-accent/60 ring-2 ring-marketplace-accent/10"
            : "border-marketplace-border hover:border-marketplace-accent/40"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {/* Icon */}
        <Tag
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 pointer-events-none"
        />

        <span className={selected ? "text-marketplace-text-primary" : "text-marketplace-text-secondary/60"}>
          {selected ? selected.name : "بدون فئة"}
        </span>

        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-marketplace-text-secondary/50 shrink-0" />
        </motion.div>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 right-0 left-0 z-50 bg-marketplace-card border border-marketplace-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Category list */}
            <div className="max-h-52 overflow-y-auto py-2 cute-scrollbar">
              {/* "No category" option */}
              <button
                type="button"
                onClick={() => { onChange(""); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                  !value
                    ? "text-marketplace-accent bg-marketplace-accent/8"
                    : "text-marketplace-text-secondary hover:bg-marketplace-bg hover:text-marketplace-text-primary"
                }`}
              >
                <span>بدون فئة</span>
                {!value && <Check size={14} className="text-marketplace-accent" />}
              </button>

              {categories.map((cat) => {
                const isSelected = String(cat.id) === String(value);
                const isDeleting = deletingId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`group flex items-center justify-between px-4 py-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? "text-marketplace-accent bg-marketplace-accent/8"
                        : "text-marketplace-text-primary hover:bg-marketplace-bg"
                    }`}
                    onClick={() => { onChange(String(cat.id)); setIsOpen(false); }}
                  >
                    <span className="text-sm font-bold flex-1 truncate">{cat.name}</span>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <Check size={14} className="text-marketplace-accent" />
                      )}

                      {/* Delete button — admin only */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(cat, e)}
                          disabled={isDeleting}
                          title="حذف الفئة"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-marketplace-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-40"
                        >
                          {isDeleting ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <p className="px-4 py-3 text-sm text-marketplace-text-secondary text-center">
                  لا توجد فئات بعد
                </p>
              )}
            </div>

            {/* Admin: add new category */}
            {isAdmin && (
              <div className="border-t border-marketplace-border/60 p-3">
                <AnimatePresence mode="wait">
                  {!showAddInput ? (
                    <motion.button
                      key="add-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowAddInput(true); }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-marketplace-accent hover:bg-marketplace-accent/10 transition-colors cursor-pointer border border-dashed border-marketplace-accent/30 hover:border-marketplace-accent/60"
                    >
                      <Plus size={15} />
                      إضافة فئة جديدة
                    </motion.button>
                  ) : (
                    <motion.div
                      key="add-input"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
                          if (e.key === "Escape") { setShowAddInput(false); setNewName(""); }
                        }}
                        placeholder="اسم الفئة الجديدة..."
                        className="flex-1 bg-marketplace-bg border border-marketplace-border rounded-xl px-3 py-2 text-sm font-bold text-marketplace-text-primary outline-none focus:border-marketplace-accent/60 transition-colors min-w-0"
                      />
                      <button
                        type="button"
                        onClick={handleAdd}
                        disabled={isAdding || !newName.trim()}
                        className="p-2 rounded-xl bg-marketplace-accent text-white hover:bg-marketplace-accent/90 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                        title="إضافة"
                      >
                        {isAdding ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddInput(false); setNewName(""); }}
                        className="p-2 rounded-xl text-marketplace-text-secondary hover:bg-marketplace-bg transition-colors cursor-pointer shrink-0"
                        title="إلغاء"
                      >
                        <X size={15} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
