"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import Modal from "@/app/_components/reuseable/Modal";
import Link from "next/link";
import { supabase } from "@/app/_lib/supabase/client";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: "", content: "" });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) setUserRole(profile.role);
    }
    checkRole();
  }, []);

  const contentMap = {
    "تصفح المتاجر": `اكتشف مجموعة واسعة من المتاجر الموثوقة في منصة واحدة. بفضل أدوات البحث والتصفية المتقدمة لدينا، يمكنك العثور على المنتجات التي تبحث عنها بسهولة وسرعة من مختلف البائعين، دون الحاجة للتنقل بين مواقع متعددة.`,

    "كيف يعمل": `ببساطة، قم بإنشاء حساب مشتري للبدء. يمكنك تصفح المتاجر المتنوعة ذات التصميم الموحد، مقارنة المنتجات، والتواصل والتفاعل بأمان من خلال منصتنا المركزية التي تضمن لك تجربة تسوق موثوقة.`,

    الدعم: `فريق الدعم لدينا وتحت إشراف الإدارة متواجد دائماً لضمان تجربة تسوق سلسة. سواء كان لديك استفسار حول طلبك، أو تحتاج إلى مساعدة في لوحة التحكم الخاصة بك كمشتري، نحن هنا لمساعدتك.`,

    "عملية الشراء والشحن": `تعتمد منصتنا نظاماً ذكياً يربط بين الأتمتة والتواصل المباشر لضمان الشفافية:
    
1. طلب المنتج: عند اختيارك لمنتج، يتم إرسال رسالة تلقائية إلى WhatsApp التاجر تتضمن بياناتك وتفاصيل المنتج.
2. تأكيد التاجر: بمجرد موافقة التاجر على الطلب، يظهر الطلب في لوحة تحكم الإدارة (Admin Dashboard) بحالة "قيد الانتظار".
3. تواصل التاجر: يقوم التاجر بالتواصل معك مباشرة لتأكيد التفاصيل النهائية للشحن.
4. تأكيد العميل: بعد تواصل التاجر، يطلب منك النظام تأكيد رغبتك في استلام الطلب ليتم نقله للمرحلة التالية.
5. تحديث الحالة: يتم تحديث حالة الطلب وتعديل بياناته في لوحة التحكم بشكل مستمر حتى وصول الشحنة إليك بنجاح.`,

    "كن تاجرًا": `انضم إلى منصتنا اليوم وقم بإطلاق متجرك الإلكتروني بسهولة. نوفر لك تصميم متجر موحد واحترافي، ولوحة تحكم متكاملة لإدارة منتجاتك ومبيعاتك، مما يتيح لك الوصول إلى قاعدة واسعة من المشترين دون أي تعقيدات تقنية.`,

    "مجتمع التجار": `شكراً لكونك جزءاً من مجتمع تجار لنك الصناعة! \n\nانضمامك كتاجر يساهم في بناء سوق إلكتروني قوي وموثوق. نحن فخورون بشراكتك ونعمل باستمرار على تطوير المنصة لتسهيل عملك وزيادة مبيعاتك.\n\nمعاً نبني مستقبل التجارة الإلكترونية في العراق. نتمنى لك التوفيق والنجاح الدائم!`,

    الموارد: `نقدم لك دليلاً شاملاً وموارد تعليمية تساعدك على إدارة متجرك بفعالية. من كيفية نشر المنتجات وتنسيقها، إلى تتبع المعاملات عبر لوحة تحكم التاجر، لضمان نمو تجارتك بكل سهولة.`,

    "شروط الخدمة": `تحدد شروط الخدمة القواعد واللوائح لاستخدام منصتنا كسوق متعدد البائعين. تشمل هذه الشروط حقوق ومسؤوليات كل من المشترين والتجار، وضوابط نشر المنتجات، وصلاحيات الإدارة في التحقق والإشراف لضمان بيئة آمنة وموثوقة للجميع.`,

    "سياسة الخصوصية": `نحن نولي أهمية قصوى لحماية بيانات مستخدمينا. توضح سياسة الخصوصية كيفية جمع واستخدام وحماية المعلومات الشخصية للمشترين والتجار، وكيفية تأمين المعاملات والبيانات الحساسة داخل المنصة الموحدة.`,

    "سياسة الكوكيز": `نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة المستخدم على منصتنا، مثل تذكر تفضيلات البحث والتصفية المتقدمة للمشترين، وتسهيل الوصول السريع للوحات تحكم التجار وتخصيص المحتوى.`,
  };

  const isDealer = userRole === "seller" || userRole === "admin";

  const merchantLink = isDealer ? "مجتمع التجار" : "كن تاجرًا";

  const linkGroups = [
    {
      title: "للمشترين",
      links: ["تصفح المتاجر", "كيف يعمل", "الدعم", "عملية الشراء والشحن"],
    },
    {
      title: "للتجار",
      links: [merchantLink, "الموارد"],
    },
    {
      title: "قانوني",
      links: ["شروط الخدمة", "سياسة الخصوصية", "سياسة الكوكيز"],
    },
  ];

  const handleLinkClick = (linkTitle: string) => {
    const content = contentMap[linkTitle as keyof typeof contentMap];
    setModalData({ title: linkTitle, content: content || "محتوى قريباً..." });
    setIsModalOpen(true);
  };

  return (
    <>
      <footer
        className="relative mt-24 bg-marketplace-bg overflow-hidden border-t border-border/40"
        dir="rtl"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-marketplace-accent/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-right">
            <div className="md:col-span-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6 text-marketplace-accent">
                <Store size={28} strokeWidth={2} />
                <h3 className="font-extrabold text-xl text-marketplace-text-primary">
                  السوق الإلكتروني
                </h3>
              </div>
              <p className="text-sm text-marketplace-text-secondary leading-relaxed max-w-xs mx-auto md:mx-0">
                سوق متعدد البائعين يربط المشترين بالتجار الموثوقين.
              </p>
            </div>

            {linkGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-bold text-lg text-marketplace-text-primary mb-6 relative inline-block">
                  {group.title}
                  <span className="absolute -bottom-2 right-0 w-1/2 h-[2px] bg-marketplace-accent/30 rounded-full" />
                </h3>
                <ul className="flex flex-col gap-3 text-sm text-marketplace-text-secondary items-center md:items-start">
                  {group.links.map((link) => (
                    <li key={link}>
                      {link === "كن تاجرًا" ? (
                        <Link
                          href={isLoggedIn ? "/merchant" : "/login"}
                          className="hover:text-marketplace-accent hover:pr-2 transition-all duration-300 inline-block text-marketplace-accent font-extrabold relative group"
                        >
                          <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-marketplace-accent rounded-full animate-pulse opacity-0 group-hover:opacity-100" />
                          {link}
                        </Link>
                      ) : link === "مجتمع التجار" ? (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="hover:text-marketplace-accent hover:pr-2 transition-all duration-300 inline-block text-marketplace-accent font-extrabold relative group text-right cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                        >
                          <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-marketplace-accent rounded-full animate-pulse opacity-0 group-hover:opacity-100" />
                          {link}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="hover:text-marketplace-accent hover:pr-2 transition-all duration-300 text-right cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                        >
                          {link}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-border/50 flex items-center justify-center text-sm text-marketplace-text-secondary">
            <p>© {new Date().getFullYear()} لنك الصناعة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalData.title}
      >
        <p className="text-base text-marketplace-text-secondary leading-relaxed whitespace-pre-line">
          {modalData.content}
        </p>
      </Modal>
    </>
  );
}
