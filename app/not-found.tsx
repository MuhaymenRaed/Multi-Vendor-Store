"use client";

import { Ghost, Home, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-marketplace-bg flex items-center justify-center p-6 overflow-hidden relative"
      dir="rtl"
    >
      {/* Background Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-marketplace-accent/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-marketplace-accent/5 blur-[120px] rounded-full" />

      <div className="max-w-xl w-full text-center relative z-10">
        {/* Animated Icon & 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <span className="text-[12rem] md:text-[16rem] font-black text-marketplace-accent/5 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Ghost className="w-24 h-24 text-marketplace-accent drop-shadow-[0_0_15px_rgba(var(--marketplace-accent-rgb),0.5)]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-marketplace-card/40 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-marketplace-border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
        >
          <h2 className="text-4xl md:text-5xl font-black text-marketplace-text-primary mb-6 tracking-tight">
            نعتذر، الرابط مفقود!
          </h2>
          <p className="text-marketplace-text-secondary mb-10 text-lg md:text-xl leading-relaxed max-w-md mx-auto">
            يبدو أن الصفحة التي تحاول الوصول إليها قد انتقلت إلى عالم آخر أو لم
            تعد موجودة في متجرنا.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Primary Action */}
            <Link href="/" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-5 cursor-pointer bg-marketplace-accent text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-marketplace-accent/20 hover:brightness-110 transition-all text-lg"
              >
                <Home className="w-6 h-6" />
                الرئيسية
              </motion.button>
            </Link>

            {/* Secondary Action */}
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-5 cursor-pointer bg-marketplace-card/80 text-marketplace-text-primary border border-marketplace-border rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-marketplace-card-hover transition-all text-lg"
            >
              <RotateCcw className="w-6 h-6" />
              الرجوع للخلف
            </motion.button>
          </div>
        </motion.div>

        {/* Decorative Progress Dots */}
        <div className="mt-16 flex justify-center items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-marketplace-accent/20" />
          <div className="w-20 h-1.5 rounded-full bg-linear-to-l from-marketplace-accent to-transparent" />
          <div className="w-2 h-2 rounded-full bg-marketplace-accent/20" />
        </div>
      </div>
    </div>
  );
}
