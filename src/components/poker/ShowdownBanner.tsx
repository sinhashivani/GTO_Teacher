"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShowdownBannerProps {
  isVisible: boolean;
  won: boolean;
  handName: string;
}

export const ShowdownBanner: React.FC<ShowdownBannerProps> = ({ isVisible, won, handName }) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Reset dismissal when a new showdown starts
  React.useEffect(() => {
    if (isVisible) {
      setIsDismissed(false);
    }
  }, [isVisible]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]"
        >
          <div className={cn(
            "relative px-12 py-6 border-4 shadow-2xl flex flex-col items-center gap-2 min-w-[300px]",
            won 
              ? "bg-tavern-green/90 border-tavern-gold text-tavern-gold" 
              : "bg-red-950/90 border-red-700 text-red-200"
          )}>
            {/* Close button */}
            <button 
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center border border-current opacity-50 hover:opacity-100 transition-opacity"
            >
              ×
            </button>

            <h2 className="text-4xl font-pixel font-bold uppercase tracking-[0.2em] drop-shadow-lg">
              {won ? "Victory" : "Defeat"}
            </h2>
            <div className="h-px w-full bg-current opacity-30 my-1" />
            <p className="text-sm font-pixel uppercase tracking-widest opacity-90">
              {handName}
            </p>
          </div>
          
          {/* Decorative glow */}
          <div className={cn(
            "absolute inset-0 -z-10 blur-2xl opacity-50",
            won ? "bg-tavern-gold" : "bg-red-600"
          )} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
