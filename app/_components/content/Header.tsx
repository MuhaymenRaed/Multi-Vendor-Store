"use client";

import { signOut } from "@/app/_lib/data-services/auth-service";
import { getProfile } from "@/app/_lib/data-services/profile-service";
import { ModeToggle } from "@/app/_lib/ModeToggle";
import { supabase } from "@/app/_lib/supabase/client";
import { LogoIcon } from "../reuseable/LogoIcon";
import Image from "next/image";
import {
  Clock,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const router = useRouter();

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const config = (() => {
    if (!user)
      return {
        href: "/login",
        label: "تسجيل الدخول",
        icon: LogIn,
        type: "login",
      };
    const role = profile?.role || "buyer";
    if (role === "admin")
      return {
        href: "/dashboard",
        label: "لوحة الإدارة",
        icon: ShieldCheck,
        type: "admin",
      };
    if (role === "guest")
      return {
        href: "#",
        label: "طلبك قيد المراجعة",
        icon: Clock,
        type: "guest",
      };
    if (role === "seller")
      return { href: `/profile`, label: "متجري", icon: Store, type: "seller" };
    return {
      href: "/profile",
      label: "الملف الشخصي",
      icon: User,
      type: "buyer",
    };
  })();

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 w-full border-b border-border bg-background/50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            {/* Elegant Icon Container - Centered */}
            <div className="w-10 h-10 rounded-[10px] bg-marketplace-accent/5 border border-marketplace-accent/10 flex items-center justify-center shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-marketplace-accent/10 group-hover:border-marketplace-accent/30 group-hover:scale-105">
              {/* The Icon */}
              <LogoIcon className="w-6 h-6 text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors duration-300" />
            </div>

            {/* Refined Typography */}
            <div className="hidden sm:flex flex-col justify-center text-right">
              <h1 className="text-xl font-black tracking-tight text-marketplace-text-primary transition-colors">
                لنك الصناعة
              </h1>
              <p className="text-[10px] font-bold text-marketplace-text-secondary uppercase tracking-widest mt-[-2px]">
                سوق المتاجر
              </p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {/* MERCHANT LINK - Only for logged-in buyers/guests */}
          {!loading &&
            user &&
            (config.type === "buyer" || config.type === "guest") && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link
                  href="/merchant"
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold text-marketplace-accent bg-marketplace-accent/5 border border-marketplace-accent/20 rounded-full hover:bg-marketplace-accent hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,188,212,0.1)]"
                >
                  <Store size={14} className="md:w-[15px] md:h-[15px]" />
                  <span className="hidden md:inline">كن تاجرًا</span>
                  <span className="md:hidden">بيع معنا</span>
                </Link>
              </motion.div>
            )}
          <div className="flex items-center gap-3">
            {/* 1. Theme Toggle - Styled to match Logo Container */}
            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-marketplace-card border border-marketplace-border hover:border-marketplace-accent/30 transition-all duration-300 shadow-sm backdrop-blur-md">
              <ModeToggle />
            </div>

            {!loading ? (
              <div className="flex items-center gap-3">
                {/* 2. Logout Button - Refined Destructive Style */}
                {config.type === "admin" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-2xl bg-(--danger)/10 border border-(--danger)/20 text-(--danger) hover:bg-(--danger) hover:text-white/70 disabled:opacity-50 transition-all duration-300 shadow-sm"
                    title="تسجيل الخروج"
                  >
                    {isSigningOut ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LogOut size={18} />
                    )}
                  </motion.button>
                )}

                {/* 3. Profile Capsule - Elegant Glassy Design */}
                <Link href={config.href}>
                  <motion.button
                    whileHover={{ y: -1 }}
                    className="flex cursor-pointer items-center gap-3 p-1 pl-4 bg-marketplace-card border border-marketplace-border rounded-full hover:border-marketplace-accent/30 hover:bg-marketplace-accent/5 transition-all duration-300 group shadow-sm backdrop-blur-md"
                  >
                    {user ? (
                      <>
                        {/* Avatar with subtle glow instead of thick border */}
                        <div className="w-8 h-8 rounded-full border border-marketplace-accent/20 overflow-hidden shadow-[0_0_10px_rgba(20,184,166,0.1)] group-hover:border-marketplace-accent/50 transition-colors">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              className="w-full h-full object-cover"
                              alt="avatar"
                            />
                          ) : (
                            <div className="w-full h-full bg-marketplace-bg flex items-center justify-center">
                              <User className="w-4 h-4 text-marketplace-text-secondary" />
                            </div>
                          )}
                        </div>

                        {/* Profile Text */}
                        <div className="flex flex-col items-start text-right">
                          <span className="text-xs font-black text-marketplace-text-primary leading-tight">
                            {profile?.full_name || "المستخدم"}
                          </span>
                          <span className="text-[9px] font-bold text-marketplace-accent uppercase tracking-wider leading-none mt-0.5 opacity-80">
                            {config.label}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 py-1 pr-3">
                        <config.icon className="w-4 h-4 text-marketplace-accent" />
                        <span className="text-xs font-black">
                          {config.label}
                        </span>
                      </div>
                    )}
                  </motion.button>
                </Link>
              </div>
            ) : (
              /* Skeleton Loader */
              <div className="w-32 h-10 bg-marketplace-card border border-marketplace-border animate-pulse rounded-full" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
