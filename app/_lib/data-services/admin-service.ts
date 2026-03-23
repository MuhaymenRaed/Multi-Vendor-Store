// Safe for client components - only uses browser Supabase client
import { supabase } from "../supabase/client";

// ─── USERS ────────────────────────────────────────────────────

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_deleted", false)
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
        role: userData.role || "buyer",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteUser(userId: string) {
  if (!userId) throw new Error("معرّف المستخدم مطلوب");
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_deleted: true })
    .eq("id", userId)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("لم يتم العثور على المستخدم");
  return data;
}

export async function getAvailableOwners() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["buyer", "seller", "admin"])
    .eq("is_deleted", false);
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
      name: updates.name,
      slug: updates.slug,
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
  if (storeId) {
    const { data, error } = await supabase
      .from("stores")
      .update(storeData)
      .eq("id", storeId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabase
      .from("stores")
      .insert([storeData])
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
    .eq("is_deleted", false)
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
