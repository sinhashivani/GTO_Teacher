"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdviceCardProps {
  message: string;
  type: "good" | "bad" | "info";
  onClose: () => void;
  autoDismiss?: number;
}

const typeConfig = {
  good: {
    headerBg: "bg-green-800",
    headerText: "text-green-200",
    label: "Great Move!",
    accentBorder: "border-l-green-500",
  },
  bad: {
    headerBg: "bg-red-900",
    headerText: "text-red-200",
    label: "Inaccurate",
    accentBorder: "border-l-red-500",
  },
  info: {
    headerBg: "bg-tavern-wood",
    headerText: "text-tavern-gold",
    label: "Insight",
    accentBorder: "border-l-tavern-gold",
  },
};

export const AdviceCard: React.FC<AdviceCardProps> = ({
  message,
  type,
  onClose,
  autoDismiss = 5000,
}) => {
  const config = typeConfig[type];

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(onClose, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-16 right-4 z-50 max-w-[280px] cursor-pointer"
        onClick={onClose}
      >
        <div
          className={cn(
            "rpg-frame border-l-4",
            config.accentBorder
          )}
        >
          {/* Header */}
          <div className={cn("px-3 py-1.5", config.headerBg)}>
            <span className={cn("text-[8px] uppercase tracking-widest font-bold", config.headerText)}>
              {config.label}
            </span>
          </div>

          {/* Body */}
          <div className="px-3 py-2 bg-tavern-parchment">
            <p className="text-[9px] text-tavern-dark leading-relaxed">
              {message}
            </p>
          </div>

          {/* Dismiss hint */}
          <div className="px-3 py-1 bg-tavern-parchment/80 border-t border-tavern-wood/20">
            <span className="text-[6px] text-tavern-wood/50 uppercase tracking-wider">
              Click to dismiss
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
