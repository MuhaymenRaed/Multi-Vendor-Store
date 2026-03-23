"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { signUp } from "@/app/_lib/data-services/auth-service";
import { LogoIcon } from "@/app/_components/reuseable/LogoIcon";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // RegisterPage.tsx (الجزء الخاص بـ handleSubmit)

  // داخل RegisterPage.tsx

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: "buyer",
      });

      // إذا تم إنشاء الحساب بنجاح وينتظر التأكيد (Session ستكون null)
      if (data.user) {
        // التوجيه لصفحة التأكيد مع تمرير الإيميل كـ Query Parameter
        router.push(
          `/confirm-email?email=${encodeURIComponent(formData.email)}`,
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success View
  if (isSuccess) {
    return (
      <div
        className="bg-marketplace-card border border-border p-8 rounded-3xl shadow-2xl text-center"
        dir="rtl"
      >
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-marketplace-text-primary mb-2">
          تم إنشاء الحساب بنجاح!
        </h2>
        <p className="text-marketplace-text-secondary mb-6 leading-relaxed">
          يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول.
        </p>
        <Link
          href="/login"
          className="text-marketplace-accent font-bold hover:underline"
        >
          الانتقال لصفحة تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div
      className="bg-marketplace-card border border-border p-8 rounded-3xl shadow-2xl"
      dir="rtl"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4 group">
          <div className="w-15 h-15 rounded-2xl bg-marketplace-accent/5 border border-marketplace-accent/10 flex items-center justify-center shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-marketplace-accent/10 group-hover:border-marketplace-accent/30 group-hover:scale-105">
            <LogoIcon className="w-10 h-10 text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors duration-300" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-marketplace-text-primary">
          إنشاء حساب جديد
        </h1>
        <p className="text-marketplace-text-secondary mt-2">
          انضم إلى مجتمعنا المتنامي كمشتري
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-marketplace-text-secondary mb-2 mr-1">
            الاسم الكامل
          </label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full bg-marketplace-bg border border-border rounded-xl py-3 pr-11 pl-4 outline-none focus:ring-2 focus:ring-marketplace-accent/50 transition-all text-marketplace-text-primary"
              placeholder="أدخل اسمك الكامل"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-marketplace-text-secondary mb-2 mr-1">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-marketplace-bg border border-border rounded-xl py-3 pr-11 pl-4 outline-none focus:ring-2 focus:ring-marketplace-accent/50 transition-all text-marketplace-text-primary"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex cursor-pointer items-center justify-center gap-2 bg-linear-to-r from-marketplace-accent to-marketplace-accent-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-marketplace-accent/20 hover:opacity-90 transition-opacity mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> جاري المعالجة...
            </>
          ) : (
            "إنشاء الحساب"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-marketplace-text-secondary">
        لديك حساب بالفعل؟{" "}
        <Link
          href="/login"
          className="text-marketplace-accent font-bold hover:underline"
        >
          تسجيل الدخول
        </Link>
      </p>
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-marketplace-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
