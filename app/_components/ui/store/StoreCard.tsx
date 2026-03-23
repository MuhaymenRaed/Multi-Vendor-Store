"use client";

import { Badge } from "@/app/_components/shadCN-ui/badge";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export function StoreCard({ store }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      dir="rtl"
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative h-full flex flex-col bg-marketplace-card/40 backdrop-blur-md shadow-sm rounded-[2rem] overflow-hidden cursor-pointer group border border-border/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,184,212,0.15)] hover:border-marketplace-accent/40"
    >
      {/* Featured Badge */}
      {store.isFeatured && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-marketplace-accent/90 backdrop-blur-md text-white border-none text-xs px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-lg shadow-marketplace-accent/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            رسمي
          </Badge>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/10">
        {store.logo_url ? (
          <>
            {/* Loading Skeleton */}
            <AnimatePresence>
              {!isLoaded && (
                <motion.div
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-marketplace-accent/5 animate-pulse"
                />
              )}
            </AnimatePresence>

            <motion.img
              src={store.logo_url}
              alt={store.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onLoad={() => setIsLoaded(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </>
        ) : (
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <div className="w-16 h-16 bg-marketplace-accent/10 rounded-full animate-pulse" />
          </div>
        )}
        {/* Subtle Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-marketplace-card via-transparent to-transparent opacity-60 z-10" />
      </div>

      <div className="p-6 text-right flex flex-col flex-1">
        <h3 className="text-xl font-black mb-2 text-marketplace-text-primary group-hover:text-marketplace-accent transition-colors duration-300">
          {store.name}
        </h3>
        <p
          dir="auto"
          className="text-sm mb-6 leading-relaxed text-marketplace-text-secondary font-medium line-clamp-2 break-words"
        >
          {store.description}
        </p>
        <div className="flex items-end justify-end flex-row-reverse mt-auto">
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
            className="hidden sm:flex items-center gap-2 text-marketplace-accent text-sm font-bold"
          >
            عرض المتجر
            <ArrowLeft className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
