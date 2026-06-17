"use client";

import { getTotalCounts } from "@/app/_lib/data-services/store-service";
import { Package, Store, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function Hero() {
  const [counts, setCounts] = useState({ stores: 0, products: 0, sellers: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getTotalCounts();
        setCounts(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { label: "متجر نشط", value: `+${counts.stores}`, icon: Store },
    { label: "منتج", value: `+${counts.products}`, icon: Package },
    { label: "بائع موثوق", value: `+${counts.sellers}`, icon: Users },
  ];

  return (
    <motion.section
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden pt-32 pb-24 px-6 border-b border-border/40 bg-marketplace-bg"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-marketplace-accent/10 dark:bg-marketplace-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-marketplace-accent-dark/10 dark:bg-marketplace-accent-dark/20 blur-[120px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-2h-2v2h2zm4 8h-2v2h2v-2zm8 4h-2v2h2v-2zm-8 2h-2v2h2v-2zm-8-8h-2v2h2v-2zm0 8h-2v2h2v-2zm0-24h-2v2h2v-2zm0 8h-2v2h2v-2zm8 8h-2v2h2v-2zm0 8h-2v2h2v-2zm0-24h-2v2h2v-2zm0 8h-2v2h2v-2zm8 8h-2v2h2v-2zm0 8h-2v2h2v-2zm0-24h-2v2h2v-2zm0 8h-2v2h2v-2zm8 8h-2v2h2v-2zm0 8h-2v2h2v-2zm0-24h-2v2h2v-2zm0 8h-2v2h2v-2zM24 20h-2v2h2v-2zM12 20h-2v2h2v-2zM0 20h-2v2h2v-2zM24 12h-2v2h2v-2zM12 12h-2v2h2v-2zM0 12h-2v2h2v-2zM24 4h-2v2h2v-2zM12 4h-2v2h2v-2zM0 4h-2v2h2v-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-marketplace-text-primary tracking-tight leading-[1.15]">
            اكتشف عالم المتاجر <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-marketplace-accent to-marketplace-accent-dark">
              بلمسة واحدة
            </span>
          </h1>
          <p className="text-lg md:text-xl text-marketplace-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed opacity-90">
            منصة تربطك بأفضل التجار المحليين. جودة، ثقة، وسهولة في الوصول.
          </p>

          {/* Moving Text Box */}
          <motion.div
            className="relative overflow-hidden mb-8 -mx-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div
              className="relative bg-gradient-to-r from-marketplace-accent/20 via-marketplace-accent/30 to-marketplace-accent/20 dark:from-marketplace-accent/30 dark:via-marketplace-accent/40 dark:to-marketplace-accent/30 border-y border-marketplace-accent/40 backdrop-blur-sm py-4 px-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-12 before:bg-gradient-to-r before:from-marketplace-bg to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-12 after:bg-gradient-to-l after:from-marketplace-bg to-transparent after:z-10"
              dir="ltr"
            >
              <div className="overflow-hidden w-full flex justify-start">
                <motion.div
                  className="flex whitespace-nowrap w-max"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    ease: "linear",
                    duration: 250 /* Adjust this number to make it faster or slower */,
                    repeat: Infinity,
                  }}
                >
                  {/* We render a flat list of 8 items. 
                  The first 4 make up the first half (0% to -50%), 
                  and the last 4 make up the second half. 
                  They are perfectly identical down to the sub-pixel.
                */}
                  {[...Array(80)].map((_, i) => (
                    <span
                      key={i}
                      dir="rtl"
                      className="inline-block px-6 text-marketplace-accent font-bold text-sm md:text-base tracking-wide flex-shrink-0"
                    >
                      توصيل سريع آمن • تجار موثوقين • أسعار تنافسية • جودة
                      مضمونة خصومات وعروض حصرية • دعم محلي مباشر • اكتشف المزيد
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-8 border-t border-border/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="text-3xl font-bold text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-marketplace-text-secondary uppercase tracking-widest">
                  <Icon className="w-4 h-4 text-marketplace-accent" />
                  {stat.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
