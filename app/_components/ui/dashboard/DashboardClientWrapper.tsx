"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/app/_components/ui/dashboard/components/SideBar";
import { DashboardHeader } from "@/app/_components/ui/dashboard/components/DashboardHeader";
import { OverviewTab } from "@/app/_components/ui/dashboard/tabs/OverviewTab";
import { UsersTab } from "@/app/_components/ui/dashboard/tabs/UserTab";
import { StoresTab } from "@/app/_components/ui/dashboard/tabs/StoreTab";
import { ProductsTab } from "@/app/_components/ui/dashboard/tabs/ProductTab";
import { RevenueTab } from "@/app/_components/ui/dashboard/tabs/RevenueTab";
import { Menu } from "lucide-react"; // Import Menu for mobile toggle
import type { TabType } from "@/app/_components/ui/dashboard/types";

export default function DashboardClientWrapper({
  initialData,
}: {
  initialData: any;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const router = useRouter();

  const handleBack = () => router.push("/");

  return (
    <div className="min-h-screen bg-marketplace-bg selection:bg-marketplace-accent/30 overflow-x-hidden">
      {/* MOBILE HEADER TOGGLE - Only visible on small screens */}
      <div className="md:hidden fixed top-4 right-4 z-[60]">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 rounded-2xl bg-marketplace-card border border-marketplace-border shadow-lg text-marketplace-accent"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR BACKDROP - Closes sidebar when clicking outside on mobile */}
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

      {/* 1. SIDEBAR - Now handles mobile transitions */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Close on selection (mobile)
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
