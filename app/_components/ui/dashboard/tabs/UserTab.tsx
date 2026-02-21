"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  ShieldCheck,
  Calendar,
  Filter,
  Check,
} from "lucide-react";
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
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const roles = ["الكل", ...Array.from(new Set(data.map((u) => u.role)))];

  const filteredUsers = data.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "الكل" || user.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. TOP COMMAND BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-marketplace-card p-4 rounded-[2rem] border border-marketplace-border shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-marketplace-text-secondary group-focus-within:text-marketplace-accent transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="البحث بالاسم أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-marketplace-bg border border-transparent focus:border-marketplace-accent/20 rounded-2xl py-3 pr-11 pl-4 outline-none text-marketplace-text-primary font-bold transition-all"
            />
          </div>

          {/* Elegant Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
                isFilterOpen
                  ? "bg-marketplace-accent text-white border-marketplace-accent"
                  : "bg-marketplace-bg text-marketplace-text-primary border-marketplace-border"
              }`}
            >
              <Filter size={18} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-48 bg-marketplace-card border border-marketplace-border rounded-2xl shadow-xl overflow-hidden py-2 z-50 backdrop-blur-xl"
                >
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setActiveFilter(role);
                        setIsFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-marketplace-card-hover transition-colors"
                    >
                      <span
                        className={`text-sm font-bold ${activeFilter === role ? "text-marketplace-accent" : "text-marketplace-text-secondary"}`}
                      >
                        {role}
                      </span>
                      {activeFilter === role && (
                        <Check size={14} className="text-marketplace-accent" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-marketplace-accent text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-marketplace-accent/20">
          <UserPlus size={18} />
          <span>إضافة مستخدم</span>
        </button>
      </div>

      {/* 2. RESPONSIVE DATA TABLE / GRID */}
      <div className="bg-marketplace-card rounded-[2.5rem] border border-marketplace-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead>
              <tr className="bg-marketplace-bg/30 border-b border-marketplace-border">
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  المستخدم
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  الدور
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  الحالة
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest">
                  تاريخ الانضمام
                </th>
                <th className="px-8 py-5 text-marketplace-text-secondary font-black text-[10px] uppercase tracking-widest text-left">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marketplace-border/50">
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 text-center"
          >
            <div className="w-20 h-20 bg-marketplace-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-marketplace-border">
              <Search
                size={32}
                className="text-marketplace-text-secondary opacity-20"
              />
            </div>
            <h3 className="text-marketplace-text-primary font-bold text-lg">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-marketplace-text-secondary text-sm">
              حاول تغيير كلمات البحث أو الفلاتر
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user }: { user: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group hover:bg-marketplace-card-hover transition-all duration-300"
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-marketplace-bg border border-marketplace-border flex items-center justify-center text-marketplace-accent font-black text-lg group-hover:scale-110 transition-transform">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-marketplace-text-primary font-bold">
              {user.name}
            </span>
            <div className="flex items-center gap-1 text-marketplace-text-secondary text-xs">
              <Mail size={12} />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-8 py-5">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
            user.role === "تاجر"
              ? "bg-marketplace-accent/5 border-marketplace-accent/20 text-marketplace-accent"
              : "bg-primary/5 border-primary/20 text-marketplace-text-primary"
          }`}
        >
          <ShieldCheck size={12} />
          {user.role}
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              user.status === "نشط"
                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                : "bg-marketplace-text-secondary"
            }`}
          />
          <span className="text-sm font-bold text-marketplace-text-primary">
            {user.status}
          </span>
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-marketplace-text-secondary text-sm font-medium">
          <Calendar size={14} />
          {user.joined}
        </div>
      </td>

      <td className="px-8 py-5 text-left">
        <TableActions isHovered={isHovered} actions={userActions} />
      </td>
    </tr>
  );
}
