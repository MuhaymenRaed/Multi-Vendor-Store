"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Store, User, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { ModeToggle } from "@/app/_lib/ModeToggle";
import { supabase } from "@/app/_lib/supabase";
import { getProfile } from "@/app/_lib/data-service";
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const profileData = await getProfile(user.id);
      setProfile(profileData);
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();

    // الاستماع لأي تغيير في حالة تسجيل الدخول أو التحديثات
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const config = (() => {
    if (!user) return { href: "/login", label: "تسجيل الدخول", icon: LogIn };
    const role = user.user_metadata?.role || "user";
    if (role === "super_admin")
      return { href: "/dashboard", label: "لوحة الإدارة", icon: ShieldCheck };
    if (role === "dealer")
      return {
        href: `/store/${user.user_metadata?.store_slug || ""}`,
        label: "متجري",
        icon: Store,
      };
    return { href: "/profile", label: "الملف الشخصي", icon: User };
  })();

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 w-full border-b border-border bg-background/50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-marketplace-accent to-[#0097a7] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              س
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors">
                السوق الإلكتروني
              </h1>
              <p className="text-[10px] text-marketplace-text-secondary">
                سوق المتاجر
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {!loading ? (
            <Link href={config.href}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 px-1 pl-4 py-1 bg-secondary hover:bg-muted border border-border rounded-full transition-all group shadow-sm"
              >
                {user ? (
                  <>
                    <div className="w-8 h-8 rounded-full border-2 border-marketplace-accent overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold leading-none">
                        {profile?.full_name || "مستخدم"}
                      </span>
                      <span className="text-[9px] text-marketplace-text-secondary leading-none mt-1">
                        {config.label}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 py-1 pr-3">
                    <config.icon className="w-4 h-4 text-marketplace-accent" />
                    <span className="text-xs font-bold">{config.label}</span>
                  </div>
                )}
              </motion.button>
            </Link>
          ) : (
            <div className="w-32 h-10 bg-muted animate-pulse rounded-full" />
          )}
        </div>
      </div>
    </header>
  );
}
