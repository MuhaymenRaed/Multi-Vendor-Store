"use client";

import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ActionButton } from "../components/ActionButton";
import { TableActions, storeActions } from "../components/TableActions";

interface StoresTabProps {
  data: {
    id: string | number;
    name: string;
    dealer: string;
    products: number;
    revenue: string;
    status: string;
  }[];
}

export function StoresTab({ data }: StoresTabProps) {
  const [hoveredStoreId, setHoveredStoreId] = useState<string | number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic for the search bar
  const filteredStores = data.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.dealer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden transition-colors duration-300 bg-marketplace-card shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="البحث عن المتاجر أو التجار..."
          />
          <ActionButton onClick={() => console.log("Add store")}>
            إضافة متجر
          </ActionButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-marketplace-bg/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                اسم المتجر
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                التاجر
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                المنتجات
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                الإيرادات
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                الحالة
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold text-left">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStores.map((store) => (
              <tr
                key={store.id}
                className="transition-colors group hover:bg-marketplace-card-hover"
                onMouseEnter={() => setHoveredStoreId(store.id)}
                onMouseLeave={() => setHoveredStoreId(null)}
              >
                <td className="px-6 py-4 text-marketplace-text-primary font-medium">
                  {store.name}
                </td>
                <td className="px-6 py-4 text-marketplace-text-secondary">
                  {store.dealer}
                </td>
                <td className="px-6 py-4 text-marketplace-text-secondary">
                  {store.products}
                </td>
                <td className="px-6 py-4 text-marketplace-accent font-bold">
                  {store.revenue}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      store.status === "نشط"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {store.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-left">
                  <TableActions
                    isHovered={hoveredStoreId === store.id}
                    actions={storeActions}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty Search Result State */}
        {filteredStores.length === 0 && (
          <div className="p-12 text-center text-marketplace-text-secondary">
            لا توجد متاجر تطابق بحثك
          </div>
        )}
      </div>
    </div>
  );
}
