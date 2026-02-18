"use client";

import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ActionButton } from "../components/ActionButton";
import { TableActions, productActions } from "../components/TableActions";

// Define the interface based on your new data schema
interface ProductsTabProps {
  data: {
    id: string | number;
    name: string;
    store: string;
    category: string;
    price: string;
    stock: number;
    status: string;
  }[];
}

export function ProductsTab({ data }: ProductsTabProps) {
  const [hoveredProductId, setHoveredProductId] = useState<
    string | number | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on search query
  const filteredProducts = data.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden transition-colors duration-300 bg-marketplace-card shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="البحث عن المنتجات أو المتاجر..."
          />
          <ActionButton onClick={() => console.log("Add product")}>
            إضافة منتج
          </ActionButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-marketplace-bg/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                اسم المنتج
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                المتجر
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                الفئة
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                السعر
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                المخزون
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
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="transition-colors group hover:bg-marketplace-card-hover"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <td className="px-6 py-4 text-marketplace-text-primary font-medium">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-marketplace-text-secondary">
                  {product.store}
                </td>
                <td className="px-6 py-4 text-marketplace-text-secondary">
                  {product.category}
                </td>
                <td className="px-6 py-4 text-marketplace-accent font-bold">
                  {product.price}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      product.stock >= 10
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : product.stock > 0
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === "متوفر"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : product.status === "مخزون منخفض"
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-left">
                  <TableActions
                    isHovered={hoveredProductId === product.id}
                    actions={productActions}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-marketplace-text-secondary">
            لا يوجد منتجات تطابق بحثك حالياً
          </div>
        )}
      </div>
    </div>
  );
}
