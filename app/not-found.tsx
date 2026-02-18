"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-marketplace-bg flex items-center justify-center p-6"
      dir="rtl"
    >
      <div className="max-w-md w-full text-center">
        {/* Animated 404 Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <h1 className="text-9xl font-black text-marketplace-accent/10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-20 h-20 text-marketplace-accent animate-pulse" />
          </div>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-marketplace-card p-8 rounded-3xl border border-border shadow-2xl"
        >
          <h2 className="text-3xl font-black text-marketplace-text-primary mb-4">
            عذراً، الصفحة غير موجودة
          </h2>
          <p className="text-marketplace-text-secondary mb-8 leading-relaxed">
            يبدو أنك ضللت الطريق أو أن الصفحة التي تبحث عنها قد تم نقلها أو
            حذفها. لا تقلق، يمكنك العودة دائماً إلى لوحة التحكم.
          </p>

          <div className="grid gap-4">
            {/* Action Buttons */}
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-marketplace-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-marketplace-accent/20 hover:brightness-110 transition-all"
              >
                <Home className="w-5 h-5" />
                العودة للوحة الإدارة
              </motion.button>
            </Link>

            <Link href="/">
              <motion.button
                whileHover={{ x: -5 }}
                className="w-full py-4 text-marketplace-text-secondary font-semibold flex items-center justify-center gap-2 hover:text-marketplace-text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                الذهاب للمتجر الرئيسي
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Subtle decorative elements matching the dashboard feel */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-12 h-1 rounded-full bg-marketplace-accent/20" />
          <div className="w-4 h-1 rounded-full bg-marketplace-accent" />
          <div className="w-12 h-1 rounded-full bg-marketplace-accent/20" />
        </div>
      </div>
    </div>
  );
}
