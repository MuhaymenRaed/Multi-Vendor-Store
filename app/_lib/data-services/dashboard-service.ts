// app/_lib/data-services/dashboard-service.ts
import { supabaseCookiesServer } from "@/app/_lib/supabase/cookiesServer";

// 1️⃣ Dashboard Stats
export async function getDashboardStats() {
  const supabase = await supabaseCookiesServer();

  const [
    { count: usersCount },
    { count: storesCount },
    { count: productsCount },
    { data: revenueData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),
    // Only sum verified sales for global stats
    supabase
      .from("orders")
      .select("product_price_at_click")
      .eq("status", "verified_sold"),
  ]);

  const totalRevenue =
    revenueData?.reduce((sum, o) => sum + (o.product_price_at_click || 0), 0) ||
    0;

  return {
    usersCount: usersCount || 0,
    storesCount: storesCount || 0,
    productsCount: productsCount || 0,
    totalRevenue,
  };
}

// 2️⃣ Growth Metrics
export async function getGrowthMetrics() {
  const supabase = await supabaseCookiesServer();

  const now = new Date();

  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const [
    { count: usersThisMonth },
    { count: usersLastMonth },
    { count: storesThisMonth },
    { count: storesLastMonth },
    { count: productsThisMonth },
    { count: productsLastMonth },
    { data: revenueThisMonthData },
    { data: revenueLastMonthData },
  ] = await Promise.all([
    // Users
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startLastMonth.toISOString()),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startTwoMonthsAgo.toISOString())
      .lt("created_at", startLastMonth.toISOString()),

    // Stores
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startLastMonth.toISOString()),

    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startTwoMonthsAgo.toISOString())
      .lt("created_at", startLastMonth.toISOString()),

    // Products
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startLastMonth.toISOString()),

    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startTwoMonthsAgo.toISOString())
      .lt("created_at", startLastMonth.toISOString()),

    // Revenue
    supabase
      .from("orders")
      .select("product_price_at_click")
      .gte("created_at", startLastMonth.toISOString()),

    supabase
      .from("orders")
      .select("product_price_at_click")
      .gte("created_at", startTwoMonthsAgo.toISOString())
      .lt("created_at", startLastMonth.toISOString()),
  ]);
  const calcGrowth = (current: number, previous: number) => {
    if (previous === 0 && current > 0) return 100;
    if (previous === 0 && current === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revNow =
    revenueThisMonthData?.reduce(
      (s, o) => s + (o.product_price_at_click || 0),
      0,
    ) || 0;

  const revBefore =
    revenueLastMonthData?.reduce(
      (s, o) => s + (o.product_price_at_click || 0),
      0,
    ) || 0;

  return {
    userGrowth: calcGrowth(usersThisMonth || 0, usersLastMonth || 0),
    storeGrowth: calcGrowth(storesThisMonth || 0, storesLastMonth || 0),
    productGrowth: calcGrowth(productsThisMonth || 0, productsLastMonth || 0),
    revGrowth: calcGrowth(revNow, revBefore),
  };
}

// app/_lib/data-services/dashboard-service.ts

export async function getDetailedRevenueData() {
  const supabase = await supabaseCookiesServer();

  // Fetch individual orders with their specific product and store relations
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      product_price_at_click,
      admin_commission_at_click,
      status,
      products (
        name,
        stores (name)
      )
    `,
    )
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (
    orders?.map((order) => {
      const storeName =
        (order.products as any)?.stores?.name || "متجر غير معروف";
      const productName = (order.products as any)?.name || "منتج غير معروف";

      return {
        id: order.id,
        date: order.created_at,
        storeName,
        productName,
        price: order.product_price_at_click || 0,
        profit: order.admin_commission_at_click || 0,
        status: order.status,
      };
    }) || []
  );
}

export async function getRecentUsers(limit = 5) {
  const supabase = await supabaseCookiesServer();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

// 5️⃣ Admin Stores
export async function getAdminStores() {
  const supabase = await supabaseCookiesServer();

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getProduct(id: string) {
  const { notFound } = await import("next/navigation");
  const supabase = await supabaseCookiesServer();

  const { data, error } = await supabase
    .from("products")
    .select("*, stores(*)")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();
  if (error || !data) notFound();
  return data;
}

export async function getTopStores() {
  const supabase = await supabaseCookiesServer();

  const { data } = await supabase
    .from("store_total_revenue")
    .select("*")
    .order("total_revenue", { ascending: false })
    .limit(5);
  return data || [];
}

export async function getStoresData() {
  const supabase = await supabaseCookiesServer();

  const { data } = await supabase.from("store_total_revenue").select("*");
  return data || [];
}

export async function getProductsCount(storeid: string) {
  const supabase = await supabaseCookiesServer();

  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true }) // head: true means "don't send me the data, just the count"
    .eq("store_id", storeid)
    .eq("is_deleted", false); // Matches your schema's soft-delete column

  if (error) {
    console.error("Error fetching product count:", error);
    return 0; // Return 0 instead of an empty array since it's a count
  }

  return count || 0;
}
// ⚠️ Server-only functions below — only call from Server Components or API routes
// These are kept here for convenience but require createServerSupabase when
// cookie-based auth is needed. Import createServerSupabase directly in those files.

export async function getStoreBySlug(slug: string) {
  const supabase = await supabaseCookiesServer();

  const { notFound } = await import("next/navigation");
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) notFound();
  return data;
}

export async function getAdminProducts() {
  const supabase = await supabaseCookiesServer();

  const { data, error } = await supabase
    .from("products")
    .select(`*, stores (id, name), categories (id, name)`)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getStorePageData(storeId: string) {
  const supabase = await supabaseCookiesServer();

  if (!storeId) return { store: null, products: [] };
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      storeId,
    );

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq(isUuid ? "id" : "slug", storeId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (storeError || !store) return { store: null, products: [] };

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_deleted", false)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return { store, products: products || [] };
}
