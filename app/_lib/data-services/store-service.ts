import { supabase } from "../supabase/client";

export async function getStores(
  sortBy: string = "all",
  currentUserId?: string,
) {
  let query = supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .eq("is_deleted", false);

  if (sortBy === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else {
    // Default and newest are descending by creation date
    query = query.order("created_at", { ascending: false });
  }

  const { data: stores, error } = await query;
  if (error) throw new Error(error.message);

  const prioritizeCurrentUserStore = (list: any[]) => {
    if (!currentUserId) return list;
    return [...list].sort((a, b) => {
      if (a.owner_id === currentUserId) return -1;
      if (b.owner_id === currentUserId) return 1;
      return 0;
    });
  };

  if (!stores || stores.length === 0) return [];

  if (sortBy === "popular") {
    const storeIds = stores.map((s) => s.id);

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("store_id")
      .in("store_id", storeIds);

    if (ordersError) throw new Error(ordersError.message);

    const orderCountByStoreId = (orders || []).reduce(
      (acc: Record<string, number>, order: any) => {
        const key = order.store_id;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {},
    );

    const sortedByPopularity = [...stores].sort((a, b) => {
      const aCount = orderCountByStoreId[a.id] || 0;
      const bCount = orderCountByStoreId[b.id] || 0;

      // Higher order count first, then newest as tiebreaker
      if (bCount !== aCount) return bCount - aCount;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return prioritizeCurrentUserStore(sortedByPopularity);
  }

  if (sortBy === "most-products") {
    const storeIds = stores.map((s) => s.id);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("store_id")
      .in("store_id", storeIds)
      .eq("is_deleted", false);

    if (productsError) throw new Error(productsError.message);

    const productCountByStoreId = (products || []).reduce(
      (acc: Record<string, number>, product: any) => {
        const key = product.store_id;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {},
    );

    const sortedByProducts = [...stores].sort((a, b) => {
      const aCount = productCountByStoreId[a.id] || 0;
      const bCount = productCountByStoreId[b.id] || 0;

      // Higher product count first, then newest as tiebreaker
      if (bCount !== aCount) return bCount - aCount;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return prioritizeCurrentUserStore(sortedByProducts);
  }

  return prioritizeCurrentUserStore(stores);
}

export async function updateStoreData(storeId: string, updates: any) {
  if (!storeId) throw new Error("Store ID is missing");

  if (updates.name) updates.name = updates.name.trim();
  if (updates.slug) updates.slug = updates.slug.trim();

  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .eq("is_deleted", false)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Store not found in database");
  return data;
}

export async function getTotalCounts() {
  const [stores, products, sellers] = await Promise.all([
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("role", ["seller", "admin"]),
  ]);
  return {
    stores: stores.count || 0,
    products: products.count || 0,
    sellers: sellers.count || 0,
  };
}

export async function getTopStores() {
  const { data } = await supabase
    .from("view_store_analytics")
    .select("*")
    .order("total_revenue", { ascending: false })
    .limit(5);
  return data || [];
}
