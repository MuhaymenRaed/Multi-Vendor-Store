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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation"; // 1. استيراد الموجه
import { supabase } from "@/app/_lib/supabase";
import { updateProfile, uploadAvatar } from "@/app/_lib/data-service";

export default function ProfilePage() {
  const router = useRouter(); // 2. تهيئة الموجه
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

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
        // تمرير الرابط القديم ليتم حذفه من الـ Bucket
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

      // --- الجزء المطلوب للتحديث الفوري للهيدر ---
      router.refresh();
      // ----------------------------------------

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

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-marketplace-accent" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-marketplace-card border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="h-32 bg-gradient-to-r from-marketplace-accent to-[#0097a7] relative" />

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl border-4 border-marketplace-card bg-marketplace-bg overflow-hidden shadow-xl text-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <User size={48} />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
                  <Camera className="text-white" />
                  <input
                    type="file"
                    hidden
                    onChange={handleImageSelect}
                    accept="image/*"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 text-right">
              <h2 className="text-2xl font-bold text-marketplace-text-primary">
                {formData.full_name || "مستخدم"}
              </h2>
              <p className="text-marketplace-text-secondary">{user?.email}</p>
            </div>

            <button
              type="button"
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              className="px-6 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-semibold"
            >
              {isEditing ? "إلغاء التعديل" : "تعديل الملف"}
            </button>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-xl flex items-center gap-2"
              >
                <CheckCircle size={18} /> {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-marketplace-text-secondary mr-1">
                الاسم الكامل
              </label>
              <input
                disabled={!isEditing}
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full bg-marketplace-bg border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-marketplace-accent/50 disabled:opacity-60 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-marketplace-text-secondary mr-1">
                اسم المستخدم
              </label>
              <input
                disabled={!isEditing}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full bg-marketplace-bg border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-marketplace-accent/50 disabled:opacity-60 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-marketplace-text-secondary mr-1">
                رقم الهاتف
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  className="w-full bg-marketplace-bg border border-border rounded-xl pr-10 pl-4 py-3 outline-none focus:ring-2 focus:ring-marketplace-accent/50 disabled:opacity-60 transition-all text-left"
                  dir="ltr"
                  placeholder="077XXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-marketplace-text-secondary mr-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-marketplace-bg border border-border rounded-xl pr-10 pl-4 py-3 opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full md:w-auto px-10 py-3 bg-marketplace-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-marketplace-accent/20 hover:opacity-90 disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Save size={18} />
                  )}
                  حفظ التغييرات
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
