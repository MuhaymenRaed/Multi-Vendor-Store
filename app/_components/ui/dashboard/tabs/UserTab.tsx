"use client";

import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ActionButton } from "../components/ActionButton";
import { TableActions, userActions } from "../components/TableActions";

interface UsersTabProps {
  data: {
    id: string | number;
    name: string;
    email: string;
    role: string;
    status: string;
    joined: string;
  }[];
}

export function UsersTab({ data }: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredUserId, setHoveredUserId] = useState<string | number | null>(
    null,
  );

  // Filter users based on search query (name or email)
  const filteredUsers = data.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden transition-colors duration-300 bg-marketplace-card shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="البحث عن المستخدمين بالاسم أو الهاتف..."
          />
          <ActionButton onClick={() => console.log("Add user")}>
            إضافة مستخدم
          </ActionButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-marketplace-bg/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                الاسم
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                البريد الإلكتروني / الهاتف
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                الدور
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                الحالة
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold">
                تاريخ الانضمام
              </th>
              <th className="px-6 py-4 text-marketplace-text-secondary font-semibold text-left">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="transition-colors group hover:bg-marketplace-card-hover"
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
              >
                <td className="px-6 py-4 text-marketplace-text-primary font-medium">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-marketplace-text-secondary">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === "تاجر"
                        ? "bg-marketplace-accent/10 text-marketplace-accent"
                        : user.role === "مدير"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "نشط"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-marketplace-text-secondary text-sm">
                  {user.joined}
                </td>
                <td className="px-6 py-4 text-left">
                  <TableActions
                    isHovered={hoveredUserId === user.id}
                    actions={userActions}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-marketplace-text-secondary">
            لم يتم العثور على مستخدمين يطابقون بحثك.
          </div>
        )}
      </div>
    </div>
  );
}
