"use client";

import { DashboardHeader } from "@/app/_components/ui/dashboard/components/DashboardHeader";
import { Sidebar } from "@/app/_components/ui/dashboard/components/SideBar";
import { OverviewTab } from "@/app/_components/ui/dashboard/tabs/OverviewTab";
import { ProductsTab } from "@/app/_components/ui/dashboard/tabs/ProductTab";
import { DiscountsTab } from "@/app/_components/ui/dashboard/tabs/DiscountsTab";
import { RequestsTab } from "@/app/_components/ui/dashboard/tabs/RequestsTab"; // New Tab Component
import { RevenueTab } from "@/app/_components/ui/dashboard/tabs/RevenueTab";
import { StoresTab } from "@/app/_components/ui/dashboard/tabs/StoreTab";
import { UsersTab } from "@/app/_components/ui/dashboard/tabs/UserTab";
import type { TabType } from "@/app/_components/ui/dashboard/types";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardClientWrapper({
  initialData,
}: {
  initialData: any;
}) {
  // Set initial tab to overview
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {}, [initialData]);

  const handleBack = () => router.push("/");

  return (
    <div className="min-h-screen bg-marketplace-bg selection:bg-marketplace-accent/30 overflow-x-hidden">
      {/* MOBILE HEADER TOGGLE */}
      <div className="md:hidden fixed top-4 right-4 z-[60]">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-3 cursor-pointer rounded-2xl bg-marketplace-card border border-marketplace-border shadow-lg text-marketplace-accent"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR BACKDROP */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 1. SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        onBack={handleBack}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main
        className={`transition-all duration-500 min-h-screen p-4 md:p-8 lg:p-12 
          ${isSidebarOpen ? "mr-0" : "mr-0 md:mr-64"}`}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto space-y-8 pt-16 md:pt-0">
          <DashboardHeader activeTab={activeTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === "overview" && (
                <OverviewTab
                  data={{
                    ...initialData,
                    storesData: initialData.storesData, // Mapping the names so they match
                  }}
                />
              )}
              {activeTab === "users" && (
                <UsersTab data={initialData.usersData} />
              )}
              {activeTab === "stores" && (
                <StoresTab
                  data={initialData.storeTabData}
                  adminStoreData={initialData.adminStoreData}
                  sideData={initialData.StoresInfo}
                />
              )}
              {activeTab === "products" && (
                <ProductsTab data={initialData.productsData} />
              )}
              {activeTab === "discounts" && <DiscountsTab />}
              {activeTab === "requests" && <RequestsTab />}
              {activeTab === "revenue" && (
                <RevenueTab revenueData={initialData.revenueData} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
