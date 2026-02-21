"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  LogOut,
  Edit3,
  X,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/_lib/supabase";
import { updateProfile, uploadAvatar, signOut } from "@/app/_lib/data-service";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [originalData, setOriginalData] = useState({
    full_name: "",
    username: "",
    phone: "",
    avatar_url: "",
  });

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    phone: "",
    avatar_url: "",
  });

  const stripCountryCode = (phone: string) => {
    if (phone?.startsWith("964")) return `0${phone.slice(3)}`;
    return phone || "";
  };

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const fetchedData = {
          full_name: profile?.full_name || user.user_metadata?.full_name || "",
          username: profile?.username || "",
          phone: stripCountryCode(profile?.phone || ""),
          avatar_url: profile?.avatar_url || "",
        };

        setFormData(fetchedData);
        setOriginalData(fetchedData);
        setPreviewUrl(fetchedData.avatar_url);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      let phoneForServer = formData.phone.replace(/\D/g, "");
      if (phoneForServer.startsWith("0"))
        phoneForServer = `964${phoneForServer.slice(1)}`;
      else if (phoneForServer && !phoneForServer.startsWith("964"))
        phoneForServer = `964${phoneForServer}`;

      let finalAvatarUrl = formData.avatar_url;
      if (selectedFile) {
        finalAvatarUrl = await uploadAvatar(
          user.id,
          selectedFile,
          originalData.avatar_url,
        );
      }

      const updatedData = {
        ...formData,
        phone: phoneForServer,
        avatar_url: finalAvatarUrl,
      };

      await updateProfile(user.id, updatedData);

      router.refresh();

      const updatedDisplayData = {
        ...updatedData,
        phone: stripCountryCode(phoneForServer),
      };

      setFormData(updatedDisplayData);
      setOriginalData(updatedDisplayData);
      setIsEditing(false);
      setSelectedFile(null);
      setMessage("تم تحديث الملف الشخصي بنجاح!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setPreviewUrl(originalData.avatar_url);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "حدث خطأ أثناء تسجيل الخروج");
      setIsLoggingOut(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-marketplace-bg">
        <Loader2 className="animate-spin text-marketplace-accent w-12 h-12" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-marketplace-bg relative overflow-hidden py-12 px-4 sm:px-6 flex items-center justify-center"
      dir="rtl"
    >
      {/* Elegant Mesh Background Polish */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[0%] right-[10%] w-[50%] h-[50%] bg-marketplace-accent/10 dark:bg-marketplace-accent/15 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[0%] left-[10%] w-[40%] h-[40%] bg-[#0097a7]/10 dark:bg-[#0097a7]/15 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-marketplace-bg/50" />
      </div>

      <div className="max-w-4xl w-full mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-marketplace-card/80 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative ring-1 ring-white/5"
        >
          {/* Header Background */}
          <div className="h-48 bg-gradient-to-br from-marketplace-accent via-[#0097a7] to-[#005f6b] relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-black/10" />{" "}
            {/* Subtle depth */}
            {/* Top Actions Container */}
            <div className="absolute top-5 left-5 right-5 z-10 flex justify-between items-center">
              {/* Logout Button (Left) */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-red-500/80 hover:text-white text-white/90 border border-white/20 rounded-full backdrop-blur-md transition-all text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                تسجيل الخروج
              </button>

              {/* Navigation to Main Page (Right) */}
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-md transition-all text-sm font-bold shadow-lg hover:scale-105"
              >
                <Home className="w-4 h-4" />
                الرئيسية
              </Link>
            </div>
          </div>

          <div className="px-6 sm:px-12 pb-12">
            {/* Profile Header Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 mb-12">
              <div className="relative group z-20">
                <motion.div
                  whileHover={isEditing ? { scale: 1.05 } : {}}
                  className={`w-40 h-40 rounded-full border-4 border-marketplace-bg bg-marketplace-card overflow-hidden shadow-2xl text-center flex-shrink-0 relative ${isEditing ? "ring-4 ring-marketplace-accent/40" : ""}`}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                      <User size={64} strokeWidth={1.5} />
                    </div>
                  )}
                </motion.div>

                {isEditing && (
                  <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-full cursor-pointer transition-opacity opacity-0 group-hover:opacity-100 z-10">
                    <Camera className="text-white mb-2 w-8 h-8" />
                    <span className="text-white text-sm font-bold">
                      تغيير الصورة
                    </span>
                    <input
                      type="file"
                      hidden
                      onChange={handleImageSelect}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 text-center sm:text-right pb-2">
                <h2 className="text-3xl md:text-4xl font-black text-marketplace-text-primary tracking-tight">
                  {formData.full_name || "مستخدم جديد"}
                </h2>
                <p className="text-marketplace-text-secondary mt-2 flex items-center justify-center sm:justify-start gap-2 font-medium">
                  <Mail className="w-4 h-4 opacity-70" /> {user?.email}
                </p>
              </div>

              <div className="pb-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-full border transition-all text-sm font-bold flex items-center justify-center gap-2 shadow-sm ${
                    isEditing
                      ? "border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      : "border-border hover:border-marketplace-accent/50 bg-marketplace-bg hover:bg-marketplace-accent/5 text-marketplace-text-primary"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <X size={18} /> إلغاء التعديل
                    </>
                  ) : (
                    <>
                      <Edit3 size={18} /> تعديل المعلومات
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ y: -10, opacity: 0, height: 0 }}
                  animate={{ y: 0, opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-2xl flex items-center gap-3 font-bold shadow-sm backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5" /> {message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              <div className="space-y-2 group">
                <label className="text-sm font-bold text-marketplace-text-secondary ml-1 block">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50 transition-opacity group-focus-within:opacity-100 group-focus-within:text-marketplace-accent" />
                  <input
                    disabled={!isEditing}
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full bg-marketplace-bg/60 border border-border/60 rounded-2xl pr-12 pl-4 py-4 outline-none focus:ring-2 focus:ring-marketplace-accent/30 focus:border-marketplace-accent disabled:opacity-60 disabled:bg-muted/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-marketplace-text-secondary ml-1 block">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-50 group-focus-within:opacity-100 group-focus-within:text-marketplace-accent">
                    @
                  </span>
                  <input
                    disabled={!isEditing}
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full bg-marketplace-bg/60 border border-border/60 rounded-2xl pr-12 pl-4 py-4 outline-none focus:ring-2 focus:ring-marketplace-accent/30 focus:border-marketplace-accent disabled:opacity-60 disabled:bg-muted/20 transition-all font-semibold"
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-marketplace-text-secondary ml-1 block">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50 transition-opacity group-focus-within:opacity-100 group-focus-within:text-marketplace-accent" />
                  <input
                    disabled={!isEditing}
                    type="tel"
                    maxLength={11}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full bg-marketplace-bg/60 border border-border/60 rounded-2xl pr-12 pl-4 py-4 outline-none focus:ring-2 focus:ring-marketplace-accent/30 focus:border-marketplace-accent disabled:opacity-60 disabled:bg-muted/20 transition-all font-semibold text-left"
                    dir="ltr"
                    placeholder="07XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-marketplace-text-secondary ml-1 block">
                  البريد الإلكتروني{" "}
                  <span className="text-xs font-normal opacity-70">
                    (غير قابل للتعديل)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50" />
                  <input
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-muted/20 border border-border/40 rounded-2xl pr-12 pl-4 py-4 opacity-70 cursor-not-allowed text-muted-foreground font-semibold text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Save Button */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="md:col-span-2 mt-6 border-t border-border/40 pt-8"
                  >
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full sm:w-auto mr-auto px-10 py-4 bg-gradient-to-r from-marketplace-accent to-[#0097a7] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-marketplace-accent/20 hover:shadow-marketplace-accent/40 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 transition-all duration-300"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" /> جاري
                          الحفظ...
                        </>
                      ) : (
                        <>
                          <Save size={20} /> حفظ التغييرات
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
