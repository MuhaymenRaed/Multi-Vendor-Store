"use client";

import { MultiSelect } from "@/app/_components/ui/dashboard/components/MultiSelect";
import {
  getCategoriesForSelect,
  getProductsForSelect,
  getProductsForSelectByStore,
  getStoresForSelect,
} from "@/app/_lib/data-services/admin-service";
import {
  createDiscounts,
  updateDiscount,
} from "@/app/_lib/data-services/discount-service";
import {
  DISCOUNT_SCOPE_LABELS,
  DISCOUNT_SCOPES,
  DISCOUNT_TYPE_LABELS,
  type DiscountScope,
  type DiscountType,
  type DiscountWithTarget,
} from "@/app/_lib/types/discount";
import {
  discountFormSchema,
  flattenDiscountErrors,
} from "@/app/_lib/validations/discount-schema";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  Calendar,
  Globe,
  Loader2,
  Percent,
  Power,
  Tag,
  TicketPercent,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount?: DiscountWithTarget | null;
  onSaved: (rows: DiscountWithTarget[]) => void;
  /** Restrict which scopes are available. Omit for admin (all 4 scopes). */
  allowedScopes?: DiscountScope[];
  /** When set (merchant mode): auto-fills store target & filters products to this store. */
  merchantStoreId?: string;
}

interface FormState {
  name: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  scope: DiscountScope;
  status: "active" | "inactive";
  start_date: string; // datetime-local string
  end_date: string;
  product_ids: string[];
  category_ids: string[]; // stringified ids
  store_ids: string[];
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  scope: "global",
  status: "active",
  start_date: "",
  end_date: "",
  product_ids: [],
  category_ids: [],
  store_ids: [],
};

// ── datetime-local <-> ISO helpers ───────────────────────────────────────────
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(val: string): string | null {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const SCOPE_ICONS: Record<DiscountScope, React.ElementType> = {
  global: Globe,
  product: Tag,
  category: AlignLeft,
  store: TicketPercent,
};

export function DiscountModal({
  isOpen,
  onClose,
  discount,
  onSaved,
  allowedScopes,
  merchantStoreId,
}: DiscountModalProps) {
  const isEdit = !!discount;
  const visibleScopes = allowedScopes ?? (DISCOUNT_SCOPES as unknown as DiscountScope[]);
  const defaultScope: DiscountScope = visibleScopes.includes("global")
    ? "global"
    : visibleScopes[0] ?? "store";
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, scope: defaultScope });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  // Load selectable targets once when the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, c, s] = await Promise.all([
          merchantStoreId
            ? getProductsForSelectByStore(merchantStoreId)
            : getProductsForSelect(),
          getCategoriesForSelect(),
          merchantStoreId ? Promise.resolve([]) : getStoresForSelect(),
        ]);
        if (cancelled) return;
        setProducts(p);
        setCategories(c);
        setStores(s);
      } catch {
        toast.error("فشل تحميل بيانات الأهداف");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, merchantStoreId]);

  // Seed form on open (edit → prefill, create → empty with correct default scope).
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (discount) {
      setForm({
        name: discount.name ?? "",
        description: discount.description ?? "",
        discount_type: discount.discount_type,
        discount_value: String(discount.discount_value ?? ""),
        scope: discount.scope,
        status: discount.status === "active" ? "active" : "inactive",
        start_date: isoToLocalInput(discount.start_date),
        end_date: isoToLocalInput(discount.end_date),
        product_ids: discount.product_id ? [discount.product_id] : [],
        category_ids: discount.category_id
          ? [String(discount.category_id)]
          : [],
        store_ids: discount.store_id ? [discount.store_id] : [],
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        scope: defaultScope,
        // merchant mode: pre-fill their store as the store target
        store_ids: merchantStoreId ? [merchantStoreId] : [],
      });
    }
  }, [discount, isOpen, defaultScope, merchantStoreId]);

  // Escape to close
  useEffect(() => {
    const handle = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name })),
    [products],
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories],
  );
  const storeOptions = useMemo(
    () => stores.map((s) => ({ value: s.id, label: s.name })),
    [stores],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  }

  async function handleSubmit() {
    const payload = {
      name: form.name,
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      scope: form.scope,
      status: form.status,
      start_date: localInputToIso(form.start_date),
      end_date: localInputToIso(form.end_date),
      product_ids: form.product_ids,
      category_ids: form.category_ids.map((id) => Number(id)),
      store_ids: form.store_ids,
    };

    const parsed = discountFormSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(flattenDiscountErrors(parsed.error));
      toast.error("يرجى تصحيح الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && discount) {
        const updated = await updateDiscount(discount.id, parsed.data);
        toast.success("تم تحديث الخصم بنجاح");
        onSaved([updated]);
      } else {
        const created = await createDiscounts(parsed.data);
        const count = created.length;
        toast.success(
          count > 1
            ? `تم إنشاء ${count} خصومات بنجاح`
            : "تم إنشاء الخصم بنجاح",
        );
        onSaved(created);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const err = (key: string) =>
    errors[key] ? (
      <p className="text-[11px] font-bold text-destructive px-1 mt-1">
        {errors[key]}
      </p>
    ) : null;

  const inputCls = (key: string) =>
    `w-full bg-marketplace-bg border rounded-2xl py-3.5 px-4 text-marketplace-text-primary font-bold outline-none transition-all ${
      errors[key]
        ? "border-destructive/60"
        : "border-marketplace-border focus:border-marketplace-accent/50"
    }`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-marketplace-card border border-marketplace-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-marketplace-border flex items-center justify-between bg-linear-to-l from-marketplace-accent/5 to-transparent">
            <h2 className="text-xl font-black text-marketplace-text-primary flex items-center gap-3">
              <div className="p-2 bg-marketplace-accent/20 rounded-xl text-marketplace-accent">
                <TicketPercent size={20} />
              </div>
              {isEdit ? "تعديل الخصم" : "إنشاء خصم جديد"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-marketplace-card-hover rounded-full text-marketplace-text-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 cute-scrollbar max-h-[70vh] space-y-7">
            {/* ── General ── */}
            <section className="space-y-4">
              <SectionTitle>المعلومات العامة</SectionTitle>

              <div className="space-y-2">
                <Label>اسم الخصم</Label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="مثال: تخفيضات نهاية العام"
                  className={inputCls("name")}
                />
                {err("name")}
              </div>

              <div className="space-y-2">
                <Label>الوصف (اختياري)</Label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="تفاصيل إضافية عن الخصم..."
                  className="w-full bg-marketplace-bg border border-marketplace-border rounded-2xl py-3 px-4 text-marketplace-text-primary font-medium outline-none resize-none focus:border-marketplace-accent/50 transition-all"
                />
                {err("description")}
              </div>
            </section>

            {/* ── Discount value ── */}
            <section className="space-y-4">
              <SectionTitle>قيمة الخصم</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>النوع</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["percentage", "fixed_amount"] as DiscountType[]).map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => set("discount_type", t)}
                          className={`px-3 py-3 rounded-2xl text-sm font-bold border transition-all cursor-pointer ${
                            form.discount_type === t
                              ? "bg-marketplace-accent text-white border-marketplace-accent shadow-md shadow-marketplace-accent/20"
                              : "bg-marketplace-bg border-marketplace-border text-marketplace-text-secondary hover:border-marketplace-accent/40"
                          }`}
                        >
                          {DISCOUNT_TYPE_LABELS[t]}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    {form.discount_type === "percentage"
                      ? "النسبة (%)"
                      : "المبلغ (د.ع)"}
                  </Label>
                  <div className="relative group">
                    <Percent
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50 group-focus-within:text-marketplace-accent transition-colors"
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.discount_value}
                      onChange={(e) => set("discount_value", e.target.value)}
                      placeholder={form.discount_type === "percentage" ? "25" : "5000"}
                      className={`${inputCls("discount_value")} pr-11`}
                    />
                  </div>
                  {err("discount_value")}
                </div>
              </div>
            </section>

            {/* ── Scope / target ── */}
            <section className="space-y-4">
              <SectionTitle>نطاق التطبيق</SectionTitle>
              <div className={`grid gap-2 ${visibleScopes.length === 4 ? "grid-cols-2 sm:grid-cols-4" : visibleScopes.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                {visibleScopes.map((s) => {
                  const Icon = SCOPE_ICONS[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        set("scope", s);
                        // In merchant mode, always keep their store pre-selected
                        if (s === "store" && merchantStoreId) {
                          setForm((f) => ({ ...f, scope: s, store_ids: [merchantStoreId] }));
                        }
                      }}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        form.scope === s
                          ? "bg-marketplace-accent text-white border-marketplace-accent shadow-md shadow-marketplace-accent/20"
                          : "bg-marketplace-bg border-marketplace-border text-marketplace-text-secondary hover:border-marketplace-accent/40"
                      }`}
                    >
                      <Icon size={18} />
                      {DISCOUNT_SCOPE_LABELS[s]}
                    </button>
                  );
                })}
              </div>

              {/* Conditional target selectors */}
              {form.scope === "product" && (
                <div className="space-y-2">
                  <Label>
                    المنتجات المستهدفة
                    {!isEdit && (
                      <span className="mr-2 text-marketplace-accent/60 font-medium">
                        (يمكن اختيار أكثر من منتج)
                      </span>
                    )}
                  </Label>
                  <MultiSelect
                    options={productOptions}
                    selected={form.product_ids}
                    onChange={(v) => set("product_ids", v)}
                    placeholder="اختر المنتجات..."
                    multiple={!isEdit}
                    emptyText="لا توجد منتجات"
                  />
                  {err("product_ids")}
                </div>
              )}

              {form.scope === "category" && (
                <div className="space-y-2">
                  <Label>
                    الفئات المستهدفة
                    {!isEdit && (
                      <span className="mr-2 text-marketplace-accent/60 font-medium">
                        (يمكن اختيار أكثر من فئة)
                      </span>
                    )}
                  </Label>
                  <MultiSelect
                    options={categoryOptions}
                    selected={form.category_ids}
                    onChange={(v) => set("category_ids", v)}
                    placeholder="اختر الفئات..."
                    multiple={!isEdit}
                    emptyText="لا توجد فئات"
                  />
                  {err("category_ids")}
                </div>
              )}

              {form.scope === "store" && (
                merchantStoreId ? (
                  <p className="text-sm text-marketplace-text-secondary bg-marketplace-accent/5 border border-marketplace-accent/20 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <TicketPercent size={16} className="text-marketplace-accent shrink-0" />
                    سيُطبَّق هذا الخصم على جميع منتجات متجرك.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label>
                      المتاجر المستهدفة
                      {!isEdit && (
                        <span className="mr-2 text-marketplace-accent/60 font-medium">
                          (يمكن اختيار أكثر من متجر)
                        </span>
                      )}
                    </Label>
                    <MultiSelect
                      options={storeOptions}
                      selected={form.store_ids}
                      onChange={(v) => set("store_ids", v)}
                      placeholder="اختر المتاجر..."
                      multiple={!isEdit}
                      emptyText="لا توجد متاجر"
                    />
                    {err("store_ids")}
                  </div>
                )
              )}

              {form.scope === "global" && (
                <p className="text-sm text-marketplace-text-secondary bg-marketplace-bg border border-marketplace-border rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Globe size={16} className="text-marketplace-accent" />
                  سيُطبَّق هذا الخصم على جميع منتجات المنصة.
                </p>
              )}
            </section>

            {/* ── Schedule ── */}
            <section className="space-y-4">
              <SectionTitle>الجدولة (اختياري)</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    <Calendar size={12} className="inline ml-1" />
                    تاريخ البدء
                  </Label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => set("start_date", e.target.value)}
                    className={inputCls("start_date")}
                  />
                  {err("start_date")}
                </div>
                <div className="space-y-2">
                  <Label>
                    <Calendar size={12} className="inline ml-1" />
                    تاريخ الانتهاء
                  </Label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => set("end_date", e.target.value)}
                    className={inputCls("end_date")}
                  />
                  {err("end_date")}
                </div>
              </div>
            </section>

            {/* ── Status ── */}
            <section className="space-y-4">
              <SectionTitle>الحالة</SectionTitle>
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                {(["active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-bold border transition-all cursor-pointer ${
                      form.status === s
                        ? s === "active"
                          ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20"
                          : "bg-marketplace-text-secondary/80 text-white border-marketplace-text-secondary"
                        : "bg-marketplace-bg border-marketplace-border text-marketplace-text-secondary hover:border-marketplace-accent/40"
                    }`}
                  >
                    <Power size={15} />
                    {s === "active" ? "نشط" : "غير نشط"}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-marketplace-border flex items-center justify-end gap-4 bg-marketplace-card">
            <button
              onClick={onClose}
              className="px-6 py-3 cursor-pointer font-bold text-marketplace-text-secondary hover:text-marketplace-text-primary transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="min-w-45 flex cursor-pointer items-center justify-center gap-3 px-10 py-3 bg-marketplace-accent text-white rounded-xl font-black shadow-lg shadow-marketplace-accent/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isEdit ? (
                "حفظ التعديلات"
              ) : (
                "إنشاء الخصم"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-black uppercase tracking-widest text-marketplace-accent">
      {children}
    </h3>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-bold text-marketplace-text-secondary uppercase block">
      {children}
    </label>
  );
}
