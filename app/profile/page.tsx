"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  LogOut,
  Edit3,
  X,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { supabase } from "@/app/_lib/supabase/client";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
} from "@/app/_lib/data-services/profile-service";
import { signOut } from "@/app/_lib/data-services/auth-service";
import { loadHeic2any } from "@/app/_components/image/loadHeic2any";
import { resizeImageForStorage } from "@/app/_components/image/resizeImageForStorage";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    phone: "",
    avatar_url: "",
  });
  const [originalData, setOriginalData] = useState({
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
    async function initProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUser(user);

        const profile = await getProfile(user.id);
        const initial = {
          full_name: profile?.full_name || user.user_metadata?.full_name || "",
          username: profile?.username || "",
          phone: stripCountryCode(profile?.phone || ""),
          avatar_url: profile?.avatar_url || "",
        };

        setFormData(initial);
        setOriginalData(initial);
        setPreviewUrl(initial.avatar_url);
      } catch (err) {
        toast.error("فشل في تحميل بيانات الملف الشخصي");
      } finally {
        setLoading(false);
      }
    }
    initProfile();

    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);

    setIsProcessingImage(true);
    try {
      let processedFile = file;

      // 1. Handle HEIC formatting for iPhones if necessary
      if (
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        const heic2any = await loadHeic2any();
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
        });
        processedFile = new File(
          Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob],
          file.name.replace(/\.[^.]+$/, ".jpg"),
          { type: "image/jpeg" },
        );
      }

      // 2. Resize and Convert to WebP (passing 800 as maxWidth to match your old code's logic)
      const finalFile = await resizeImageForStorage(processedFile, 800);

      // 3. Update State
      setSelectedFile(finalFile);
      setPreviewUrl(URL.createObjectURL(finalFile));
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error("حدث خطأ أثناء معالجة الصورة");
      // Fallback to original file if processing fails
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const updatePromise = async () => {
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

        const finalData = {
          ...formData,
          phone: phoneForServer,
          avatar_url: finalAvatarUrl,
        };
        await updateProfile(user.id, finalData);

        const displayData = {
          ...finalData,
          phone: stripCountryCode(phoneForServer),
        };

        setFormData(displayData);
        setOriginalData(displayData);
        setIsEditing(false);
        setSelectedFile(null);

        return "تم تحديث الملف الشخصي بنجاح!";
      } catch (err: any) {
        console.error("Update failed:", err);
        throw new Error(err.message || "فشل التحديث");
      }
    };

    toast.promise(updatePromise(), {
      loading: "جاري حفظ التغييرات...",
      success: (msg) => msg,
      error: (err) => err.message,
      finally: () => {
        setUpdating(false);
        router.refresh();
      },
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.promise(signOut(), {
      loading: "جاري تسجيل الخروج...",
      success: () => {
        router.push("/login");
        return "تم تسجيل الخروج";
      },
      error: "فشل تسجيل الخروج",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-marketplace-bg">
        <Loader2 className="animate-spin text-marketplace-accent w-12 h-12" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-marketplace-bg relative overflow-hidden py-12 px-4 flex items-center justify-center"
      dir="rtl"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-marketplace-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-marketplace-accent-dark/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl w-full mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-marketplace-card/80 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="h-40 bg-linear-to-br from-marketplace-accent to-marketplace-accent-dark relative">
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 cursor-pointer bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all text-sm font-bold flex items-center gap-2"
              >
                <LogOut size={16} /> تسجيل الخروج
              </button>
              <Link
                href="/"
                className="px-4 py-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all text-sm font-bold flex items-center gap-2"
              >
                <Home size={16} /> الرئيسية
              </Link>
            </div>
          </div>

          <div className="px-6 sm:px-12 pb-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-10">
              <div className="relative group">
                <div
                  className={`w-36 h-36 rounded-full border-4 border-marketplace-bg bg-marketplace-card overflow-hidden shadow-xl relative ${isEditing ? "ring-4 ring-marketplace-accent/30" : ""}`}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <User size={48} />
                    </div>
                  )}
                  {(isProcessingImage || updating) && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 rounded-full">
                      <Loader2
                        className="text-marketplace-accent animate-spin"
                        size={28}
                      />
                      <span className="text-[9px] font-black text-white tracking-wide">
                        {isProcessingImage
                          ? "جاري المعالجة..."
                          : "جاري الرفع..."}
                      </span>
                    </div>
                  )}
                  {isEditing && !isProcessingImage && !updating && (
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-8 h-8" />
                      <input
                        type="file"
                        hidden
                        onChange={handleImageSelect}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-right">
                <h2 className="text-3xl font-black text-marketplace-text-primary">
                  {formData.full_name || "مستخدم"}
                </h2>
                <p className="text-marketplace-text-secondary flex items-center justify-center sm:justify-start gap-2">
                  <Mail size={14} />
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() =>
                  isEditing
                    ? (setFormData(originalData),
                      setPreviewUrl(originalData.avatar_url),
                      setIsEditing(false))
                    : setIsEditing(true)
                }
                className={`px-6 py-2.5 cursor-pointer rounded-full border font-bold flex items-center gap-2 transition-all ${isEditing ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-primary border-border bg-marketplace-bg"}`}
              >
                {isEditing ? (
                  <>
                    <X size={18} /> إلغاء
                  </>
                ) : (
                  <>
                    <Edit3 size={18} /> تعديل
                  </>
                )}
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                {
                  label: "الاسم الكامل",
                  key: "full_name",
                  icon: User,
                  type: "text",
                },
                {
                  label: "اسم المستخدم",
                  key: "username",
                  icon: () => "",
                  type: "text",
                },
                { label: "رقم الهاتف", key: "phone", icon: Phone, type: "tel" },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-xs font-bold text-marketplace-text-secondary mr-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <field.icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      disabled={!isEditing}
                      value={(formData as any)[field.key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full bg-marketplace-bg border border-border/60 rounded-2xl pr-12 pl-4 py-3.5 focus:ring-2 focus:ring-marketplace-accent/20 outline-none transition-all disabled:opacity-50 font-semibold"
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-xs font-bold text-marketplace-text-secondary mr-1">
                  البريد (ثابت)
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                  <input
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-muted/30 border border-border/40 rounded-2xl pr-12 pl-4 py-3.5 opacity-60 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="md:col-span-2 pt-6"
                  >
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full sm:w-auto cursor-pointer px-10 py-4 bg-marketplace-accent text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg hover:brightness-110 disabled:opacity-70 transition-all"
                    >
                      {updating ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      حفظ التغييرات
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
