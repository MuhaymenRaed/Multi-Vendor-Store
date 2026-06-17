"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface MultiSelectOption {
  value: string; // always string; numeric ids are stringified by the caller
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** When false the control behaves as a single-select (used on edit). */
  multiple?: boolean;
  disabled?: boolean;
  emptyText?: string;
}

/**
 * Searchable multi/single select with chips, matching the dashboard's
 * dropdown styling (see CategorySelect). Closes on outside click & Escape.
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "اختر...",
  multiple = true,
  disabled = false,
  emptyText = "لا توجد عناصر",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const labelFor = (v: string) =>
    options.find((o) => o.value === v)?.label ?? v;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (value: string) => {
    if (!multiple) {
      onChange([value]);
      setOpen(false);
      setQuery("");
      return;
    }
    onChange(
      selectedSet.has(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const removeChip = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full min-h-[52px] flex items-center justify-between gap-2 bg-marketplace-bg border rounded-2xl py-2.5 px-4 text-marketplace-text-primary font-bold outline-none transition-all cursor-pointer ${
          open
            ? "border-marketplace-accent/60 ring-2 ring-marketplace-accent/10"
            : "border-marketplace-border hover:border-marketplace-accent/40"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-marketplace-text-secondary/60 font-medium">
              {placeholder}
            </span>
          ) : (
            selected.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 bg-marketplace-accent/10 text-marketplace-accent text-xs font-bold px-2.5 py-1 rounded-lg max-w-full"
              >
                <span className="truncate">{labelFor(v)}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeChip(v, e)}
                  className="hover:text-destructive transition-colors shrink-0"
                >
                  <X size={12} />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-marketplace-text-secondary/50 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute top-full mt-2 right-0 left-0 z-50 bg-marketplace-card border border-marketplace-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-marketplace-border/60">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-marketplace-text-secondary/50"
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث..."
                  className="w-full bg-marketplace-bg border border-marketplace-border rounded-xl py-2 pr-9 pl-3 text-sm font-bold text-marketplace-text-primary outline-none focus:border-marketplace-accent/60 transition-colors"
                />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto py-2 cute-scrollbar">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-marketplace-text-secondary text-center">
                  {emptyText}
                </p>
              ) : (
                filtered.map((o) => {
                  const isSel = selectedSet.has(o.value);
                  return (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => toggle(o.value)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                        isSel
                          ? "text-marketplace-accent bg-marketplace-accent/8"
                          : "text-marketplace-text-primary hover:bg-marketplace-bg"
                      }`}
                    >
                      <span className="truncate">{o.label}</span>
                      {isSel && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {multiple && selected.length > 0 && (
              <div className="border-t border-marketplace-border/60 p-2 flex items-center justify-between">
                <span className="text-xs text-marketplace-text-secondary font-bold px-2">
                  {selected.length} محدد
                </span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs font-bold text-marketplace-text-secondary hover:text-destructive transition-colors px-2 py-1 cursor-pointer"
                >
                  مسح الكل
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
