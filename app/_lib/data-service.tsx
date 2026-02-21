import { notFound } from "next/navigation";
import { supabase } from "./supabase";
import { format } from "date-fns";
import { ar } from "date-fns/locale"; // npm install date-fns

// app/_lib/data-service.ts

// app/_lib/data-service.ts

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId, // المفتاح الأساسي للتعرف على السجل
      ...updates, // البيانات المراد تحديثها أو إضافتها
      updated_at: new Date(), // اختياري: لتسجيل وقت التحديث
    })
    .select()
    .maybeSingle(); // استخدم maybeSingle بدلاً من single لتجنب الخطأ إذا فشل الاسترداد

  if (error) {
    console.error("Profile update error:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function uploadAvatar(
  userId: string,
  file: File,
  oldImageUrl?: string,
) {
  try {
    // 1. حذف الملف القديم إذا وُجد
    if (oldImageUrl && oldImageUrl.includes("galary/")) {
      const fileName = oldImageUrl.split("galary/").pop();
      if (fileName) {
        await supabase.storage.from("galary").remove([fileName]);
      }
    }

    // 2. رفع الملف الجديد باسم فريد (بصمة زمنية) لمنع التخزين المؤقت
    const fileExt = file.name.split(".").pop();
    const newFileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("galary")
      .upload(newFileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("galary").getPublicUrl(newFileName);
    return data.publicUrl;
  } catch (error) {
    throw error;
  }
}
export async function signUp({
  email,
  password,
  fullName,
  role = "user",
}: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, // 'super_admin', 'dealer', or 'user'
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * SIGN IN: Authenticates the user
 */
export async function signIn({ email, password }: any) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * SIGN OUT
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * GET SESSION: Helper to check if someone is logged in
 */
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// app/_lib/data-service.ts
export async function getStorePageData(storeId: string) {
  if (!storeId) return { store: null, products: [] };

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      storeId,
    );

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq(isUuid ? "id" : "slug", storeId)
    .maybeSingle(); // <--- This is the key fix for the "coercion" error

  if (storeError || !store) return { store: null, products: [] };

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return { store, products: products || [] };
}

export async function getGrowthMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Fetch counts for two periods
  const [currentUsers, previousUsers, currentRev, previousRev] =
    await Promise.all([
      // Users current 30 days
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("created_at", thirtyDaysAgo.toISOString()),
      // Users previous 30 days
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString()),
      // Revenue current 30 days
      supabase
        .from("orders")
        .select("product_price_at_click")
        .eq("status", "verified_sold")
        .gt("created_at", thirtyDaysAgo.toISOString()),
      // Revenue previous 30 days
      supabase
        .from("orders")
        .select("product_price_at_click")
        .eq("status", "verified_sold")
        .gt("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString()),
    ]);

  const calcGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  };

  const currentRevTotal =
    currentRev.data?.reduce(
      (acc, row) => acc + row.product_price_at_click,
      0,
    ) || 0;
  const previousRevTotal =
    previousRev.data?.reduce(
      (acc, row) => acc + row.product_price_at_click,
      0,
    ) || 0;

  return {
    userGrowth: calcGrowth(currentUsers.count || 0, previousUsers.count || 0),
    revGrowth: calcGrowth(currentRevTotal, previousRevTotal),
  };
}

export async function getDashboardStats() {
  // Parallel fetch for speed
  const [users, stores, products, revenue] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("product_price_at_click")
      .eq("status", "verified_sold"),
  ]);

  // Calculate Total Revenue manually or via RPC
  const totalRevenue =
    revenue.data?.reduce((acc, curr) => acc + curr.product_price_at_click, 0) ||
    0;

  return {
    usersCount: users.count || 0,
    storesCount: stores.count || 0,
    productsCount: products.count || 0,
    totalRevenue: totalRevenue,
  };
}

export async function getRecentUsers() {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  return data || [];
}

export async function getTopStores() {
  const { data } = await supabase
    .from("view_store_analytics") // The view we created in SQL
    .select("*")
    .order("total_revenue", { ascending: false })
    .limit(5);
  return data || [];
}

export async function getRevenueChartData() {
  const { data } = await supabase
    .from("view_monthly_revenue") // The view we created in SQL
    .select("*");
  return data || [];
}

export async function getInventoryWarnings() {
  const { data } = await supabase
    .from("products")
    .select("*, stores(name)")
    .lt("stock_quantity", 5) // Fetch low stock items
    .limit(5);
  return data || [];
}

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

/////////////
// STORES

// Add to your service file
export async function getTotalCounts() {
  const [stores, products, sellers] = await Promise.all([
    supabase.from("stores").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "seller"),
  ]);

  return {
    stores: stores.count || 0,
    products: products.count || 0,
    sellers: sellers.count || 0,
  };
}

export async function getStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load stores");
  return data;
}

export async function getStoreBySlug(slug: string) {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();
  return data;
}

/////////////
// PRODUCTS

export async function getProducts(storeId?: string, categoryId?: number) {
  let query = supabase.from("products").select("*, stores(name, logo_url)");

  if (storeId) query = query.eq("store_id", storeId);
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error("Products could not be loaded");
  return data;
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, stores(*)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  return data;
}

/////////////
// CATEGORIES

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw new Error("Categories could not be loaded");
  return data;
}

/////////////
// ORDERS & VERIFICATION (The "Lead" Logic)

/**
 * Creates a "Lead" record when a user clicks BUY.
 * This starts the verification timer.
 */
export async function createOrderLead(newOrder: {
  buyer_id: string;
  store_id: string;
  product_id: string;
  product_price_at_click: number;
  admin_commission_at_click: number;
}) {
  const { data, error } = await supabase
    .from("orders")
    .insert([newOrder])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Lead could not be recorded");
  }

  return data;
}

/**
 * Used by the Seller Dashboard to see potential customers
 */
export async function getStoreOrders(storeId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, products(name), profiles(full_name, phone)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Orders could not be loaded");
  return data;
}

/**
 * CRITICAL: The Verification Step.
 * Called when the buyer clicks "YES" in the follow-up message.
 */
export async function verifyPurchase(orderId: string, isConfirmed: boolean) {
  const status = isConfirmed ? "verified_sold" : "verified_not_sold";

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      buyer_confirmed_at: isConfirmed ? new Date().toISOString() : null,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error("Verification failed");
  return data;
}

/////////////
// ADMIN & ANALYTICS

export async function getAdminInvoices() {
  const { data, error } = await supabase
    .from("monthly_store_invoices")
    .select("*");

  if (error) throw new Error("Could not fetch invoices");
  return data;
}
