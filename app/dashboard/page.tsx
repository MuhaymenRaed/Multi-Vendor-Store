// app/admin/dashboard/page.tsx
import { getDashboardData } from "@/app/_lib/data";
import DashboardClientWrapper from "@/app/_components/ui/dashboard/DashboardClientWrapper";
import DashboardLoadingSkeleton from "./loading";
import { Suspense } from "react";

async function DashboardDataLayer() {
  const allData = await getDashboardData();
  return <DashboardClientWrapper initialData={allData} />;
}

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-marketplace-bg">
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardDataLayer />
      </Suspense>
    </div>
  );
}
