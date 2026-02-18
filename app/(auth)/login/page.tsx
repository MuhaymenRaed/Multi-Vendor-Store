"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { signIn } from "@/app/_lib/data-service"; // Ensure this path is correct

export default function LoginPage() {
  const router = useRouter();

  // 1. Local State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn({ email, password });

      // 3. Success: Redirect to home and refresh to update Header state
      router.push("/");
      router.refresh();
    } catch (err: any) {
      // 4. Error handling
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-marketplace-card border border-border p-8 rounded-3xl shadow-2xl"
      dir="rtl"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-marketplace-accent to-[#0097a7] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-marketplace-accent/20">
          <span className="text-3xl font-bold text-white">س</span>
        </div>
        <h1 className="text-2xl font-bold text-marketplace-text-primary">
          تسجيل الدخول
        </h1>
        <p className="text-marketplace-text-secondary mt-2">
          أهلاً بك مجدداً في السوق الإلكتروني
        </p>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-marketplace-text-secondary mb-2 mr-1">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-marketplace-bg border border-border rounded-xl py-3 pr-11 pl-4 outline-none focus:ring-2 focus:ring-marketplace-accent/50 transition-all text-marketplace-text-primary"
              placeholder="example@mail.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-marketplace-text-secondary mb-2 mr-1">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-marketplace-bg border border-border rounded-xl py-3 pr-11 pl-4 outline-none focus:ring-2 focus:ring-marketplace-accent/50 transition-all text-marketplace-text-primary"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-marketplace-accent to-[#0097a7] text-white font-bold py-3 rounded-xl shadow-lg shadow-marketplace-accent/20 hover:opacity-90 transition-opacity mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الدخول...
            </>
          ) : (
            "دخول"
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-border pt-6">
        <p className="text-marketplace-text-secondary">
          ليس لديك حساب؟{" "}
          <Link
            href="/register"
            className="text-marketplace-accent font-bold hover:underline"
          >
            أنشئ حساباً جديداً
          </Link>
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-marketplace-text-primary mt-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
