"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitMerchantInquiry } from "@/app/_lib/data-services/admin-service";
import { toast } from "react-hot-toast";
import { Store, Send, ArrowRight } from "lucide-react";
import ElegantLoader from "@/app/merchant/loading";
import { motion } from "motion/react";

export default function BecomeMerchantPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await submitMerchantInquiry(data);
      toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريباً.");

      (e.target as HTMLFormElement).reset();

      // Luxury delay before redirecting to home
      setTimeout(() => {
        router.push("/");
      }, 2500);
    } catch (err) {
      toast.error("حدث خطأ، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto py-12 md:py-20 px-6"
      dir="rtl"
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-marketplace-text-secondary hover:text-marketplace-accent transition-all mb-10 font-bold text-sm cursor-pointer"
      >
        <ArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />
        <span>العودة للصحفة السابقة</span>
      </button>

      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-marketplace-accent/10 rounded-[2rem] flex items-center justify-center text-marketplace-accent mx-auto mb-6 shadow-[0_0_30px_rgba(0,188,212,0.15)]">
          <Store size={40} />
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tight">انضم كتاجر</h1>
        <p className="text-marketplace-text-secondary max-w-md mx-auto leading-relaxed">
          ابدأ رحلتك التجارية معنا. املأ البيانات وسيقوم فريقنا بمراجعة طلبك
          خلال 24 ساعة.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-marketplace-card/40 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-marketplace-accent/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold mr-2 text-marketplace-text-secondary">
              الاسم الكامل
            </label>
            <input
              required
              name="full_name"
              placeholder="الاسم الثلاثي"
              className="w-full bg-marketplace-bg/30 border border-marketplace-input-border rounded-2xl px-5 py-4 outline-none focus:border-marketplace-accent focus:ring-4 focus:ring-marketplace-accent/5 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold mr-2 text-marketplace-text-secondary">
              اسم المتجر
            </label>
            <input
              required
              name="store_name"
              placeholder="اسم علامتك التجارية"
              className="w-full bg-marketplace-bg/30 border border-marketplace-input-border rounded-2xl px-5 py-4 outline-none focus:border-marketplace-accent focus:ring-4 focus:ring-marketplace-accent/5 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold mr-2 text-marketplace-text-secondary">
              البريد الإلكتروني
            </label>
            <input
              required
              type="email"
              name="email"
              placeholder="example@mail.com"
              className="w-full bg-marketplace-bg/30 border border-marketplace-input-border rounded-2xl px-5 py-4 outline-none focus:border-marketplace-accent focus:ring-4 focus:ring-marketplace-accent/5 transition-all text-right"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold mr-2 text-marketplace-text-secondary">
              رقم الهاتف
            </label>
            <input
              required
              name="phone"
              placeholder="07XXXXXXXX"
              className="w-full bg-marketplace-bg/30 border border-marketplace-input-border rounded-2xl px-5 py-4 outline-none focus:border-marketplace-accent focus:ring-4 focus:ring-marketplace-accent/5 transition-all text-left placeholder:text-right"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold mr-2 text-marketplace-text-secondary">
            رسالة إضافية (اختياري)
          </label>
          <textarea
            name="message"
            rows={4}
            placeholder="حدثنا قليلاً عن المنتجات التي تود بيعها..."
            className="w-full bg-marketplace-bg/30 border border-marketplace-input-border rounded-2xl px-5 py-4 outline-none focus:border-marketplace-accent focus:ring-4 focus:ring-marketplace-accent/5 transition-all resize-none"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-marketplace-accent text-white py-5 rounded-[1.5rem] font-black text-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,188,212,0.25)] disabled:opacity-70 cursor-pointer overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {loading ? (
            <ElegantLoader />
          ) : (
            <>
              <Send size={22} /> إرسال طلب الانضمام
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
