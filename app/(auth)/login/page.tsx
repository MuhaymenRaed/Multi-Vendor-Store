"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { signIn } from "@/app/_lib/data-services/auth-service";
import { supabase } from "@/app/_lib/supabase/client"; // Ensure you import your client
import { LogoIcon } from "@/app/_components/reuseable/LogoIcon";

function getArabicAuthError(message?: string) {
  if (!message) return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";

  const lower = message.toLowerCase();

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_credentials")
  ) {
    return "بيانات تسجيل الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور ثم حاول مرة أخرى.";
  }

  if (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed")
  ) {
    return "لم يتم تأكيد البريد الإلكتروني بعد. يرجى فتح رسالة التأكيد في بريدك أولاً.";
  }

  if (lower.includes("too many requests")) {
    return "تمت محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم أعد المحاولة.";
  }

  if (lower.includes("network") || lower.includes("fetch")) {
    return "تعذر الاتصال بالخادم. يرجى التحقق من الإنترنت ثم المحاولة مرة أخرى.";
  }

  return "تعذر تسجيل الدخول حالياً. تحقق من البيانات وحاول مرة أخرى.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await signIn({ email, password });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(getArabicAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery session ready");
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const handleForgotPassword = async () => {
    if (!email) {
      setError("يرجى إدخال بريدك الإلكتروني أولاً");
      return;
    }
    setResetLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(getArabicAuthError(error.message));
    } else {
      setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
    }
    setResetLoading(false);
  };

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
          تسجيل الدخول
        </h1>
        <p className="text-marketplace-text-secondary mt-2">
          أهلاً بك مجدداً في السوق الإلكتروني
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl text-center">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 text-green-500 text-sm rounded-xl text-center">
          {message}
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
          <div className="flex justify-between items-center mb-2 mr-1">
            <label className="block text-sm font-medium text-marketplace-text-secondary">
              كلمة المرور
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="cursor-pointer text-xs text-marketplace-accent hover:underline disabled:opacity-50"
            >
              {resetLoading ? "جاري الإرسال..." : "نسيت كلمة المرور؟"}
            </button>
          </div>
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
          className="w-full flex cursor-pointer items-center justify-center gap-2 bg-linear-to-r from-marketplace-accent to-marketplace-accent-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-marketplace-accent/20 hover:opacity-90 transition-opacity mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول"}
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
          <ArrowLeft className="w-4 h-4" /> العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
