"use client";

import {
  getMerchantInquiries,
  updateInquiryStatus,
} from "@/app/_lib/data-services/admin-service";
import { motion } from "framer-motion";
import {
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Store,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export function RequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const data = await getMerchantInquiries();
      setRequests(data);
    } catch (err) {
      toast.error("فشل في تحميل طلبات الانضمام");
    } finally {
      setLoading(false);
    }
  }

  async function onAction(id: string, type: "accepted" | "rejected") {
    setProcessingId(id);
    try {
      await updateInquiryStatus(id, type);
      toast.success(
        type === "accepted" ? " تم قبول الطلب كـ 'مؤهل'" : " تم رفض الطلب",
      );
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-marketplace-accent" size={40} />
        <p className="text-marketplace-text-secondary font-bold">
          جاري تحميل طلبات الانضمام...
        </p>
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-marketplace-card border border-marketplace-border rounded-[2rem] p-6 flex items-center gap-4 w-fit">
        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-marketplace-text-secondary text-xs font-bold uppercase">
            طلبات جديدة
          </p>
          <p className="text-3xl font-black text-marketplace-text-primary">
            {requests.length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-center p-10 opacity-50">
            لا توجد طلبات جديدة حالياً
          </p>
        ) : (
          requests.map((req, index) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-marketplace-card border border-marketplace-border p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-marketplace-accent/10 rounded-xl flex items-center justify-center text-marketplace-accent">
                    <Store size={20} />
                  </div>
                  <h3 className="text-lg font-black text-marketplace-text-primary">
                    {req.store_name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-marketplace-text-secondary">
                  <div className="flex items-center gap-2">
                    <User size={14} /> <span>المسؤول: {req.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> <span>{req.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={14} className="shrink-0" />{" "}
                    <span className="truncate">{req.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="mt-1" />{" "}
                    <p className="line-clamp-2 italic">"{req.message}"</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => onAction(req.id, "accepted")}
                  disabled={!!processingId}
                  className="flex-1 md:flex-none cursor-pointer bg-green-500/10 text-green-500 px-6 py-2.5 rounded-xl font-bold border border-green-500/20 hover:bg-green-500/20"
                >
                  {processingId === req.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "قبول كمرشح"
                  )}
                </button>
                <button
                  onClick={() => onAction(req.id, "rejected")}
                  disabled={!!processingId}
                  className="flex-1 md:flex-none cursor-pointer bg-red-500/10 text-red-500 px-6 py-2.5 rounded-xl font-bold border border-red-500/20"
                >
                  رفض
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
