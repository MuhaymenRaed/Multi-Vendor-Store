"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/app/_lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-marketplace-card border border-marketplace-border p-6 md:p-10 rounded-[2.5rem] shadow-2xl transition-all relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-marketplace-accent/10 text-marketplace-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-marketplace-text-primary">
                  تعيين كلمة مرور جديدة
                </h1>
                <p className="text-marketplace-text-secondary mt-2 text-sm">
                  أدخل كلمة مرور قوية لحماية حسابك في السوق
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl text-center animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-marketplace-text-secondary mr-1">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-marketplace-bg border border-marketplace-border rounded-xl py-3 pr-11 pl-4 outline-none focus:ring-2 focus:ring-marketplace-accent/50 transition-all text-marketplace-text-primary"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-marketplace-text-secondary mr-1">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-marketplace-bg border border-marketplace-border rounded-xl py-3 pr-11 pl-4 outline-none focus:ring-2 focus:ring-marketplace-accent/50 transition-all text-marketplace-text-primary"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="w-full flex cursor-pointer items-center justify-center gap-2 bg-linear-to-r from-marketplace-accent to-marketplace-accent-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-marketplace-accent/20 hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "تحديث كلمة المرور"
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-marketplace-text-primary mb-2">
                تم التحديث بنجاح!
              </h2>
              <p className="text-marketplace-text-secondary mb-8">
                لقد قمت بتغيير كلمة المرور. سيتم توجيهك الآن...
              </p>
              <div className="flex items-center justify-center gap-2 text-marketplace-accent font-medium">
                جاري التحويل <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
