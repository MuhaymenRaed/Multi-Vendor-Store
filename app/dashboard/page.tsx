import { Metadata } from "next";
import { Suspense } from "react";
import { getDashboardData } from "@/app/_lib/data";
import DashboardClientWrapper from "@/app/_components/ui/dashboard/DashboardClientWrapper";
import DashboardLoadingSkeleton from "./loading";

// 1. Metadata for SEO & Browser Tab
export const metadata: Metadata = {
  title: "لوحة التحكم | إدارة المنصة",
  description: "نظرة عامة على أداء المتجر، المستخدمين، والإيرادات",
};

// 2. The Data Layer (Server Component)
async function DashboardDataLayer() {
  // Artificial delay if you want to test your skeleton during development:
  // await new Promise((resolve) => setTimeout(resolve, 1500));

  const allData = await getDashboardData();

  return <DashboardClientWrapper initialData={allData} />;
}

// 3. The Main Page Entry
export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-marketplace-bg selection:bg-marketplace-accent/20">
      {/* Suspense handles the 'loading' state. 
          The DashboardLoadingSkeleton should mirror the layout of your DashboardClientWrapper 
      */}
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardDataLayer />
      </Suspense>
    </div>
  );
}
