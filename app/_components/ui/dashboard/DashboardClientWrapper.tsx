"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/app/_components/ui/dashboard/components/SideBar";
import { DashboardHeader } from "@/app/_components/ui/dashboard/components/DashboardHeader";
import { OverviewTab } from "@/app/_components/ui/dashboard/tabs/OverviewTab";
import { UsersTab } from "@/app/_components/ui/dashboard/tabs/UserTab";
import { StoresTab } from "@/app/_components/ui/dashboard/tabs/StoreTab";
import { ProductsTab } from "@/app/_components/ui/dashboard/tabs/ProductTab";
import { RevenueTab } from "@/app/_components/ui/dashboard/tabs/RevenueTab";
import type { TabType } from "@/app/_components/ui/dashboard/types";

export default function DashboardClientWrapper({
  initialData,
}: {
  initialData: any;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-marketplace-bg">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={handleBack}
      />

      <main className="mr-64 p-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader activeTab={activeTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Pass specific data slices to each tab based on the new prop logic */}
              {activeTab === "overview" && <OverviewTab data={initialData} />}

              {activeTab === "users" && (
                <UsersTab data={initialData.usersData} />
              )}

              {activeTab === "stores" && (
                <StoresTab data={initialData.storesData} />
              )}

              {activeTab === "products" && (
                <ProductsTab data={initialData.productsData} />
              )}

              {activeTab === "revenue" && (
                <RevenueTab
                  revenueData={initialData.revenueData}
                  statsData={initialData.statsData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
