"use client";

import { Store } from "lucide-react";
import { motion } from "motion/react";

interface ElegantLoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export function ElegantLoader({
  fullScreen = false,
  text = "جاري التحميل...",
}: ElegantLoaderProps) {
  const LoaderContent = (
    <div className="flex flex-col items-center justify-center gap-6" dir="rtl">
      {/* Visual Loader */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-marketplace-accent/20 blur-[30px] rounded-full animate-pulse" />

        {/* Outer Spinning Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-y-2 border-r-2 border-transparent border-t-marketplace-accent border-r-marketplace-accent-dark opacity-80"
        />

        {/* Inner Counter-Spinning Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-x-2 border-b-2 border-transparent border-b-marketplace-accent-dark border-l-marketplace-accent opacity-60"
        />

        {/* Center Static Icon with Pulse */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 bg-marketplace-bg/50 p-3 rounded-full backdrop-blur-sm border border-border/50 shadow-inner"
        >
          <Store className="w-6 h-6 text-marketplace-accent" />
        </motion.div>
      </div>

      {/* Loading Text */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-marketplace-text-primary font-bold tracking-wide"
        >
          {text}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            ...
          </motion.span>
        </motion.div>
      )}
    </div>
  );

  // If fullScreen is true, wrap it in a beautiful glassmorphic overlay
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-marketplace-bg/80 backdrop-blur-xl"
      >
        {LoaderContent}
      </motion.div>
    );
  }

  // Otherwise, return just the loader for inline use
  return LoaderContent;
}
