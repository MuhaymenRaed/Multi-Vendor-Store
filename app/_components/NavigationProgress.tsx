"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(pathname);

  const startProgress = useCallback(() => {
    setIsNavigating(true);
    setProgress(0);

    // Simulate progress that slows down as it approaches 90%
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.max(1, (90 - current) * 0.1);
      if (current >= 90) current = 90;
      setProgress(current);
    }, 100);
  }, []);

  const completeProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(100);
    setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 300);
  }, []);

  // Detect route change completion
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      completeProgress();
      prevPathRef.current = pathname;
    }
  }, [pathname, completeProgress]);

  // Intercept internal link clicks to start progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        anchor.target === "_blank"
      )
        return;

      // Only trigger for internal navigation to a different path
      if (href !== pathname) {
        startProgress();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startProgress]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => startProgress();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [startProgress]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-9999 h-0.75"
        >
          {/* Glow backdrop */}
          <div className="absolute inset-0 h-1.5 bg-marketplace-accent/20 blur-sm" />

          {/* Progress bar */}
          <motion.div
            className="h-full bg-linear-to-r from-marketplace-accent via-marketplace-accent-dark to-marketplace-accent rounded-full shadow-[0_0_12px_var(--marketplace-accent)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
