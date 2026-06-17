"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import Modal from "@/app/_components/reuseable/Modal";
import Link from "next/link";
import { supabase } from "@/app/_lib/supabase/client";

export default function Footer() {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: "", content: "" });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);
      setUserEmail(user.email || "");
      // Try to get phone from user_metadata or profile
      let phone = user.user_metadata?.phone || "";
      if (!phone) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", user.id)
          .single();
        if (profile?.phone) phone = profile.phone;
      }
      setUserPhone(phone);
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
    setIsContentModalOpen(true);
  };

  return (
    <>
      <footer
        className="relative mt-24 bg-marketplace-bg overflow-hidden border-t border-border/40"
        dir="rtl"
      >
        {/* Elegant Support Button */}
        {isLoggedIn && (
          <div className="fixed bottom-8 left-8 z-50 flex flex-col items-center">
            <button
              className="bg-linear-to-tr cursor-pointer from-marketplace-accent to-marketplace-accent-dark text-white rounded-full shadow-xl flex items-center gap-3 px-6 py-3 font-extrabold text-lg hover:scale-105 hover:shadow-2xl transition-all border-2 border-white/60 backdrop-blur-lg focus:outline-none focus:ring-4 focus:ring-marketplace-accent/30"
              onClick={() => setIsSupportModalOpen(true)}
              aria-label="الدعم الفني"
              style={{ boxShadow: "0 6px 24px 0 rgba(60, 72, 180, 0.15)" }}
            >
              <svg
                width="24"
                height="24"
                repeatCount="indefinite"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6 animate-bounce group-hover:animate-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zm-9 4h.01"
                />
              </svg>
              <span className="tracking-wide">الدعم الفني</span>
            </button>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-marketplace-accent/50 to-transparent" />
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
                  <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-marketplace-accent/30 rounded-full" />
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
            <p>
              © {new Date().getFullYear()} لنك الصناعة. جميع الحقوق محفوظة. |
              QRCode Team™
            </p>
          </div>
        </div>
      </footer>
      {/* Support Modal */}
      <Modal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        title="الدعم الفني"
      >
        <div className="flex flex-col gap-8 items-center py-6 w-full">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <a
              href={`mailto:sajadnaeem2024@gmail.com?subject=دعم%20فني%20من%20${encodeURIComponent(userEmail)}&body=يرجى%20كتابة%20استفسارك%20هنا.%0A%0Aالبريد%20الإلكتروني:%20${encodeURIComponent(userEmail)}${userPhone ? `%0Aرقم%20الهاتف:%20${encodeURIComponent(userPhone)}` : ""}`}
              className="flex-1 flex items-center justify-center gap-3 bg-marketplace-accent/10 hover:bg-marketplace-accent/20 text-marketplace-accent font-extrabold rounded-2xl px-8 py-5 transition-all min-w-44 text-lg shadow-lg border-2 border-marketplace-accent/20 hover:border-marketplace-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
              <span className="font-bold">البريد الإلكتروني</span>
            </a>
            <a
              href={`https://wa.me/9647717333838?text=${encodeURIComponent(`مرحباً، أحتاج إلى دعم فني. البريد الإلكتروني: ${userEmail}${userPhone ? `، رقم الهاتف: ${userPhone}` : ""}`)}`}
              className="flex-1 flex items-center justify-center gap-3 bg-green-100 hover:bg-green-200 text-green-700 font-extrabold rounded-2xl px-8 py-5 transition-all min-w-44 text-lg shadow-lg border-2 border-green-300 hover:border-green-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="font-bold">واتساب</span>
            </a>
          </div>
          <div className="text-center text-marketplace-text-secondary text-base mt-4">
            <span>
              سيتم تحويلك مباشرة إلى قناة الدعم مع بياناتك لتسهيل الخدمة.
            </span>
          </div>
        </div>
      </Modal>
      {/* Content Modal for footer links */}
      <Modal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        title={modalData.title}
      >
        <div
          className="py-4 text-marketplace-text-secondary leading-relaxed whitespace-pre-line text-right"
          dir="rtl"
        >
          {modalData.content}
        </div>
      </Modal>
    </>
  );
}
