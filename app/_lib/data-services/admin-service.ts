// Safe for client components - only uses browser Supabase client
import { supabase } from "../supabase/client";

// ─── USERS ────────────────────────────────────────────────────

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminUpdateUser(userId: string, updates: any) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: updates.full_name,
      phone: updates.phone,
      email: updates.email,
      role: updates.role,
      status: updates.status === "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreateUser(userData: {
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
}) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        full_name: userData.full_name,
        phone: userData.phone || "",
        email: userData.email,
        role: userData.role || "buyer",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Permanently delete user from both profiles and auth tables
export async function adminDeleteUser(userId: string) {
  if (!userId) throw new Error("معرّف المستخدم مطلوب");
  // 1. Delete from profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (profileError) throw new Error(profileError.message);

  // 2. Delete from auth.users (requires service_role key, only works server-side)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "فشل حذف المستخدم من جدول auth");
  }
  return { success: true };
}

export async function getAvailableOwners() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["buyer", "seller", "admin"]);
  if (error) throw new Error(error.message);
  return data || [];
}

// ─── STORES ───────────────────────────────────────────────────

export async function adminToggleStoreActive(
  storeId: string,
  isActive: boolean,
) {
  const { data, error } = await supabase
    .from("stores")
    .update({ is_active: isActive })
    .eq("id", storeId)
    .eq("is_deleted", false)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteStore(storeId: string) {
  const { data, error } = await supabase
    .from("stores")
    .update({ is_deleted: true })
    .eq("id", storeId)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("لم يتم العثور على المتجر");
}

export async function updateStore(storeId: string, updates: any) {
  const { data, error } = await supabase
    .from("stores")
    .update({
      owner_id: updates.owner_id || null,
      name: updates.name?.trim(),
      slug: updates.slug?.trim(),
      phone: updates.phone,
      logo_url: updates.logo_url,
      monthly_hosting_fee: parseFloat(updates.monthly_hosting_fee),
      commission_fee_per_sale: parseFloat(updates.commission_fee_per_sale),
      address: updates.address,
      description: updates.description,
      is_active: updates.is_active,
    })
    .eq("id", storeId)
    .eq("is_deleted", false)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadStoreLogo(storeId: string, file: File) {
  const bucket = "stores";

  // CRITICAL: Guard clause to prevent "Cannot read properties of undefined"
  if (!file) {
    console.error("No file provided to uploadStoreLogo");
    return null;
  }

  try {
    // 1. Cleanup: List files in the specific STORE folder
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(bucket)
      .list(storeId);

    if (listError) throw listError;

    // 2. Clear old logos (Infinite Storage Principle)
    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles
        .filter((x) => x.name !== ".emptyFolderPlaceholder")
        .map((x) => `${storeId}/${x.name}`);

      if (filesToRemove.length > 0) {
        await supabase.storage.from(bucket).remove(filesToRemove);
      }
    }

    // 3. Prepare path: [STORE_ID]/[TIMESTAMP].[EXT]
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${storeId}/${fileName}`;

    // 4. Perform the upload (This handles INSERT and UPDATE/UPSERT)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 5. Return Public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return `${data.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error("Store logo upload error:", error);
    throw error;
  }
}

export async function adminUpsertStore(
  storeId: string | undefined,
  storeData: any,
) {
  const sanitized = {
    ...storeData,
    name: storeData.name?.trim(),
    slug: storeData.slug?.trim(),
  };
  if (storeId) {
    const { data, error } = await supabase
      .from("stores")
      .update(sanitized)
      .eq("id", storeId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabase
      .from("stores")
      .insert([sanitized])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}

// ─── MERCHANT INQUIRIES ─────────────────────────────────────
// @/app/_lib/data-services/admin-service.ts

export async function getMerchantInquiries() {
  const { data, error } = await supabase
    .from("merchant_inquiries")
    .select("*")
    .in("status", ["new", "contacted"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateInquiryStatus(
  id: string,
  status: "contacted" | "accepted" | "rejected",
) {
  const { error } = await supabase
    .from("merchant_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Accept a merchant inquiry.
 *
 * Logic:
 *  - If a store already exists with the same name or slug → add the applicant
 *    as a co_owner member of that existing store (no duplicate store created).
 *  - Otherwise → create a brand-new store and set the applicant as owner.
 *  - If the applicant is not registered yet → update status with a warning.
 */
export async function acceptMerchantInquiry(inquiryId: string): Promise<{
  store: Record<string, unknown> | null;
  linked: boolean;   // true = joined existing store, false = new store created
  warning: string | null;
}> {
  // 1. Fetch the inquiry
  const { data: inquiry, error: iqErr } = await supabase
    .from("merchant_inquiries")
    .select("*")
    .eq("id", inquiryId)
    .single();
  if (iqErr || !inquiry) throw new Error(iqErr?.message ?? "الطلب غير موجود");

  const storeName: string = (inquiry.store_name ?? "").trim();

  // 2. Build candidate slug from the requested store name
  const candidateSlug = storeName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9؀-ۿ-]/g, "")
    .slice(0, 40);

  // 3. Check if a store with the same name OR slug already exists
  const { data: existingStores } = await supabase
    .from("stores")
    .select("id, name, slug, owner_id")
    .eq("is_deleted", false)
    .or(`name.ilike.${storeName},slug.ilike.${candidateSlug}`)
    .limit(1);

  const existingStore = existingStores?.[0] ?? null;

  // 4. Find the registered profile for the applicant's email
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .ilike("email", inquiry.email ?? "")
    .limit(1);

  const profile = profileRows?.[0] ?? null;

  let resultStore: Record<string, unknown> | null = null;
  let linked = false;
  let warning: string | null = null;

  if (!profile) {
    // Applicant not registered yet — just accept the inquiry with a warning
    warning = `المتجر لم يُعالَج تلقائياً — المستخدم (${inquiry.email}) غير مسجّل بعد في المنصة.`;
  } else if (existingStore) {
    // ── Existing store: add applicant as co_owner member ──────────────
    // Avoid duplicate membership
    const { data: already } = await supabase
      .from("store_members")
      .select("id")
      .eq("store_id", existingStore.id)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (!already) {
      await supabase.from("store_members").insert([{
        store_id: existingStore.id,
        user_id: profile.id,
        role: "co_owner",
        added_by: null,
      }]);
    }

    // Promote to seller
    await supabase.from("profiles").update({ role: "seller" }).eq("id", profile.id);

    resultStore = existingStore as Record<string, unknown>;
    linked = true;
  } else {
    // ── New store: create it and set applicant as owner ────────────────
    const uniqueSlug = `${candidateSlug}-${Date.now().toString(36)}`;

    resultStore = await adminUpsertStore(undefined, {
      owner_id: profile.id,
      name: storeName,
      slug: uniqueSlug,
      phone: inquiry.phone ?? profile.phone ?? "",
      is_active: true,
      is_deleted: false,
    });

    // Promote to seller
    await supabase.from("profiles").update({ role: "seller" }).eq("id", profile.id);
  }

  // 5. Mark the inquiry as accepted
  await updateInquiryStatus(inquiryId, "accepted");

  return { store: resultStore, linked, warning };
}

// Service for the public form
export async function submitMerchantInquiry(formData: any) {
  const { error } = await supabase
    .from("merchant_inquiries")
    .insert([formData]);

  if (error) throw new Error(error.message);
}

// ─── PRODUCTS ─────────────────────────────────────────────────

export async function getAdminProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`*, stores (id, name), categories (id, name)`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminUpsertProduct(
  productId: string | null | undefined,
  productData: any,
) {
  // 1. التحقق من وجود المعرفات الأساسية لمنع خطأ الـ null في قاعدة البيانات
  if (!productData.store_id) {
    throw new Error("يجب اختيار متجر صالح لهذا المنتج");
  }

  const payload = {
    name: productData.name,
    price: Number(productData.price),
    description: productData.description || null,
    stock_quantity: Number(productData.stock_quantity) || 0,
    // إزالة Number() لأن store_id عادة ما يكون UUID (string)
    store_id: productData.store_id,
    category_id: productData.category_id
      ? Number(productData.category_id)
      : null,
    image_url: productData.image_url || null,
    updated_at: new Date().toISOString(), // تحديث وقت التعديل
    is_deleted: false, // تأكد من أن المنتج غير محذوف
  };

  if (productId) {
    // عملية التحديث (Update)
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Update product error:", error);
      throw new Error(error.message || "فشل تحديث المنتج");
    }
    return data;
  } else {
    // عملية الإضافة (Insert) في حال لم يكن هناك productId
    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Insert product error:", error);
      throw new Error(error.message || "فشل إضافة المنتج الجديد");
    }
    return data;
  }
}
export async function adminDeleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .update({ is_deleted: true })
    .eq("id", productId);
  if (error) throw new Error(error.message);
}

// ─── SELECT HELPERS ───────────────────────────────────────────

export async function getStoresForSelect() {
  const { data, error } = await supabase
    .from("stores")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getCategoriesForSelect() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getProductsForSelect() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_deleted", false)
    .order("name");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getProductsForSelectByStore(storeId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .eq("store_id", storeId)
    .eq("is_deleted", false)
    .order("name");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createCategory(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9؀-ۿ-]/g, "");
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name: name.trim(), slug }])
    .select("id, name")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// 5️⃣ Admin Stores
export async function getAdminStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}
