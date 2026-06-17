import { z } from "zod";
import { DISCOUNT_SCOPES, DISCOUNT_TYPES } from "@/app/_lib/types/discount";

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema for the discount create/edit form.
//
// Mirrors the DB CHECK constraint:
//   scope='product'  → at least one product selected
//   scope='category' → at least one category selected
//   scope='store'    → at least one store selected
//   scope='global'   → no target needed
//
// Also enforces percentage ∈ (0, 100] and a valid date window.
// ─────────────────────────────────────────────────────────────────────────────

export const discountFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "الاسم قصير جداً")
      .max(255, "الاسم طويل جداً"),
    description: z.string().trim().max(2000, "الوصف طويل جداً").default(""),

    discount_type: z.enum(DISCOUNT_TYPES),
    discount_value: z
      .number({ message: "أدخل قيمة صحيحة" })
      .positive("يجب أن تكون القيمة أكبر من صفر"),

    scope: z.enum(DISCOUNT_SCOPES),
    status: z.enum(["active", "inactive"]),

    start_date: z.string().nullable().default(null),
    end_date: z.string().nullable().default(null),

    product_ids: z.array(z.string()).default([]),
    category_ids: z.array(z.number()).default([]),
    store_ids: z.array(z.string()).default([]),
  })
  // Percentage cannot exceed 100%
  .refine(
    (d) => d.discount_type !== "percentage" || d.discount_value <= 100,
    {
      message: "النسبة المئوية لا يمكن أن تتجاوز 100%",
      path: ["discount_value"],
    },
  )
  // Scope-specific target requirements (matches the DB CHECK constraint)
  .refine((d) => d.scope !== "product" || d.product_ids.length > 0, {
    message: "اختر منتجاً واحداً على الأقل",
    path: ["product_ids"],
  })
  .refine((d) => d.scope !== "category" || d.category_ids.length > 0, {
    message: "اختر فئة واحدة على الأقل",
    path: ["category_ids"],
  })
  .refine((d) => d.scope !== "store" || d.store_ids.length > 0, {
    message: "اختر متجراً واحداً على الأقل",
    path: ["store_ids"],
  })
  // End date must be after start date when both are present
  .refine(
    (d) =>
      !d.start_date ||
      !d.end_date ||
      new Date(d.end_date) > new Date(d.start_date),
    {
      message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
      path: ["end_date"],
    },
  );

export type DiscountFormSchema = z.infer<typeof discountFormSchema>;

// Flatten Zod issues into a { fieldPath: message } map for inline form errors.
export function flattenDiscountErrors(
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
