"use client";

import Link from "next/link";
import { Store } from "lucide-react";

export default function Footer() {
  const linkGroups = [
    { title: "للمشترين", links: ["تصفح المتاجر", "كيف يعمل", "الدعم"] },
    { title: "للتجار", links: ["كن تاجراً", "لوحة التحكم", "الموارد"] },
    {
      title: "قانوني",
      links: ["شروط الخدمة", "سياسة الخصوصية", "سياسة الكوكيز"],
    },
  ];

  return (
    <footer
      className="relative mt-24 bg-marketplace-bg overflow-hidden"
      dir="rtl"
    >
      {/* Elegant Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-marketplace-accent/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-right">
          {/* Brand/About Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6 text-marketplace-accent">
              <Store size={28} strokeWidth={2} />
              <h3 className="font-extrabold text-xl text-marketplace-text-primary">
                السوق الإلكتروني
              </h3>
            </div>
            <p className="text-sm text-marketplace-text-secondary leading-relaxed max-w-xs">
              سوق متعدد البائعين يربط المشترين بالتجار الموثوقين، لتجربة تسوق
              سلسة وآمنة.
            </p>
          </div>

          {/* Links Sections */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-bold text-lg text-marketplace-text-primary mb-6 relative inline-block">
                {group.title}
                <span className="absolute -bottom-2 right-0 w-1/2 h-[2px] bg-marketplace-accent/30 rounded-full" />
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-marketplace-text-secondary">
                {group.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="hover:text-marketplace-accent hover:pr-2 transition-all duration-300 inline-block"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-marketplace-text-secondary">
          <p>
            © {new Date().getFullYear()} السوق الإلكتروني. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            {/* You can add social icons here later */}
          </div>
        </div>
      </div>
    </footer>
  );
}
