import {
  getAdminProducts,
  getAdminStores,
  getDashboardStats,
  getDetailedRevenueData,
  getGrowthMetrics,
  getRecentUsers,
  getStoresData,
  getTopStores,
} from "@/app/_lib/data-services/dashboard-service";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * server-side function to fetch and format all dashboard data
 */
export async function getDashboardData() {
  // 1. Fetch Raw Data in Parallel for Performance

  const adminStoreData = await getAdminStores();

  const [
    stats,
    growth,
    recentUsers,
    topStores,
    detailedRevenue,
    adminProducts,
    adminStores,
    storesInfo,
  ] = await Promise.all([
    getDashboardStats(),
    getGrowthMetrics(),
    getRecentUsers(1000),
    getTopStores(),
    getDetailedRevenueData(),
    getAdminProducts(),
    getAdminStores(),
    getStoresData(),
  ]);

  // 2. Format Stats Cards with Real Growth
  // Inside getDashboardData function in your data.ts
  const statsData = [
    {
      label: "إجمالي المستخدمين",
      value: stats.usersCount.toLocaleString("en-US"),
      icon: "Users",
      change: `${growth.userGrowth >= 0 ? "+" : ""}${growth.userGrowth}%`,
      trend: growth.userGrowth >= 0 ? "up" : "down",
    },
    {
      label: "المتاجر النشطة",
      value: stats.storesCount.toLocaleString("en-US"),
      icon: "Store",
      change: `${growth.storeGrowth >= 0 ? "+" : ""}${growth.storeGrowth}%`,
      trend: growth.storeGrowth >= 0 ? "up" : "down",
    },
    {
      label: "المنتجات",
      value: stats.productsCount.toLocaleString("en-US"),
      icon: "Package",
      change: `${growth.productGrowth >= 0 ? "+" : ""}${growth.productGrowth}%`,
      trend: growth.productGrowth >= 0 ? "up" : "down",
    },
    {
      label: "الإيرادات المحققة",
      value: `${stats.totalRevenue.toLocaleString("en-US")} د.ع`,
      icon: "DollarSign",
      change: `${growth.revGrowth >= 0 ? "+" : ""}${growth.revGrowth}%`,
      trend: growth.revGrowth >= 0 ? "up" : "down",
    },
  ];

  // 3. Format Users Table
  const usersData = recentUsers.map((user: any) => ({
    id: user.id,
    name: user.full_name || "مستخدم جديد",
    email: user.email || "بدون بريد",
    phone: user.phone || "بدون رقم هاتف",
    date: user.created_at || new Date().toISOString(),
    role:
      user.role === "seller"
        ? "تاجر"
        : user.role === "admin"
          ? "مدير"
          : user.role === "buyer"
            ? "مشتري"
            : "زائر",
    status: user.status ? "نشط" : "غير نشط",
    joined: formatDistanceToNow(new Date(user.created_at), {
      addSuffix: true,
      locale: ar,
    }),
  }));

  // Inside getDashboardData() in your data.ts file

  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  // Map individual orders for the new granular Revenue Tab
  const revenueData = detailedRevenue.map((item: any) => {
    const d = new Date(item.date);
    return {
      id: item.id,
      date: item.date, // Keep the full timestamp for exact chart plotting
      month: months[d.getMonth()],
      year: d.getFullYear(),
      storeName: item.storeName,
      productName: item.productName,
      price: item.price,
      profit: item.profit,
      status: item.status,
    };
  });

  // 4. Format Stores Table
  const storesData = topStores.map((store: any) => ({
    id: store.store_id,
    name: store.store_name,
    products: store.products_count,
    revenue: `${store.total_revenue} د.ع`,
  }));

  const StoresInfo = storesInfo.map((store: any) => ({
    id: store.store_id,
    name: store.store_name,
    products: store.products_count,
    revenue: store.total_revenue,
  }));

  const storeTabData = adminStores.map((store: any) => ({
    id: store.id,
    name: store.name,
    ownerId: store.owner_id,
    dealerName: store.dealer_name,
    productCount: store.product_count,
    totalRevenue: store.total_revenue,
    slug: store.slug,
    phone: store.phone,
    description: store.description,
    isActive: store.is_active,
    createdAt: store.created_at,
    monthlyHostingFee: store.monthly_hosting_fee,
    commissionFeePerSale: store.commission_fee_per_sale,
    address: store.address,
    logoUrl: store.logo_url,
    isOfficial: store.is_official,
  }));

  // 5. Format Products
  const productsData = adminProducts.map((prod: any) => {
    let statusLabel = "متوفر";
    if (prod.stock_quantity === 0) statusLabel = "نفذ المخزون";
    else if (prod.stock_quantity <= 5) statusLabel = "مخزون منخفض";
    else statusLabel = "متوفر";
    return {
      id: prod.id,
      store_id: prod.store_id,
      name: prod.name,
      store: prod.stores?.name,
      category: prod.categories?.name,
      price: prod.price,
      stock: prod.stock_quantity,
      status: statusLabel,
      image_url: prod.image_url,
      description: prod.description,
    };
  });

  return {
    statsData,
    usersData,
    storesData,
    productsData,
    revenueData,
    storeTabData,
    adminStoreData,
    StoresInfo,
  };
}
