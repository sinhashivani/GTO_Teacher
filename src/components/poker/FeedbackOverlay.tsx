"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackOverlayProps {
  message: string;
  type: "good" | "bad" | "info";
  onClose: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ message, type, onClose }) => {
  const colors = {
    good: "bg-green-600 border-green-400 text-white",
    bad: "bg-red-800 border-red-400 text-white",
    info: "bg-tavern-dark border-tavern-gold text-tavern-gold",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`fixed bottom-40 left-1/2 -translate-x-1/2 z-[60] p-4 pixel-border border-2 ${colors[type]} font-pixel text-center min-w-[300px]`}
        onClick={onClose}
      >
        <div className="uppercase text-xs tracking-widest mb-1">
          {type === "good" ? "Great Move!" : type === "bad" ? "Inaccurate" : "Notice"}
        </div>
        <div className="text-[10px] leading-relaxed">
          {message}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
