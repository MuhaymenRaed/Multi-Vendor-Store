"use client";

import { Suspense } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Home,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmOrderPageContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const states = {
    success: {
      icon: (
        <CheckCircle2
          className="w-16 h-16 text-marketplace-accent"
          strokeWidth={1.5}
        />
      ),
      glow: "var(--marketplace-accent)",
      title: "تم التأكيد بنجاح",
      desc: "لقد تم توثيق استلام الطلب. نتمنى أن تنال تجربتك معنا رضاك التام.",
      showSparkles: true,
    },
    disputed: {
      icon: (
        <AlertTriangle
          className="w-16 h-16 text-destructive"
          strokeWidth={1.5}
        />
      ),
      glow: "var(--destructive)",
      title: "تم تسجيل البلاغ",
      desc: "لقد سجلنا عدم استلامك للطلب. سيقوم فريقنا بمراجعة الأمر والتواصل معك فوراً.",
      showSparkles: false,
    },
    error: {
      icon: (
        <XCircle className="w-16 h-16 text-destructive" strokeWidth={1.5} />
      ),
      glow: "var(--destructive)",
      title: "حدث خطأ ما",
      desc: "لم نتمكن من معالجة هذا الطلب. قد يكون الرابط منتهياً أو تم استخدامه مسبقاً.",
      showSparkles: false,
    },
  };

  const current = states[status as keyof typeof states] || states.error;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-marketplace-bg relative overflow-hidden transition-colors duration-700"
      dir="rtl"
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${current.glow} 0%, transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass Card */}
        <div className="relative overflow-hidden rounded-[3rem] bg-marketplace-card backdrop-blur-3xl border border-marketplace-border shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] p-10 sm:p-14 text-center">
          {/* Internal Soft Glow */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ backgroundColor: current.glow }}
          />

          {/* Icon Container */}
          <div className="mb-12 flex justify-center relative">
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative"
            >
              <div className="flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-background/40 backdrop-blur-xl border border-marketplace-border shadow-inner relative z-10">
                {current.icon}
              </div>

              {current.showSparkles && (
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-3 -right-3 text-marketplace-accent"
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Typography */}
          <div className="space-y-4 mb-14 relative z-10">
            <h1 className="text-3xl font-bold text-marketplace-text-primary tracking-tight">
              {current.title}
            </h1>
            <p className="text-marketplace-text-secondary leading-relaxed text-base font-light max-w-[280px] mx-auto">
              {current.desc}
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-6 relative z-10">
            <Link
              href="/"
              className="group relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold overflow-hidden transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
              <Home className="w-5 h-5" />
              العودة للرئيسية
              <ArrowRight className="w-4 h-4 mr-1 group-hover:-translate-x-2 transition-transform duration-300 rotate-180" />
            </Link>

            {status !== "success" && (
              <p className="text-xs text-marketplace-text-secondary">
                تواجه مشكلة؟{" "}
                <Link
                  href="mailto:support@market.com"
                  className="text-marketplace-text-primary font-medium hover:underline underline-offset-4"
                >
                  تواصل مع الدعم الفني
                </Link>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ConfirmOrderFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-marketplace-bg"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-[3rem] bg-marketplace-card border border-marketplace-border p-10 text-center">
        <p className="text-marketplace-text-secondary">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function ConfirmOrderPage() {
  return (
    <Suspense fallback={<ConfirmOrderFallback />}>
      <ConfirmOrderPageContent />
    </Suspense>
  );
}
