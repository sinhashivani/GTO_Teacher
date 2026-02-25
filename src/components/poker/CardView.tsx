import React from "react";
import { Card as CardType } from "@/lib/poker/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardViewProps {
  card?: CardType;
  hidden?: boolean;
  className?: string;
  delay?: number;
}

const SuitIcon = ({ suit }: { suit: CardType["suit"] }) => {
  const color = suit === "h" || suit === "d" ? "text-red-600" : "text-tavern-dark";
  const icons = { h: "\u2665", d: "\u2666", s: "\u2660", c: "\u2663" };
  return <span className={cn("text-lg leading-none", color)}>{icons[suit]}</span>;
};

export const CardView: React.FC<CardViewProps> = ({ card, hidden, className, delay = 0 }) => {
  if (hidden || !card) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, duration: 0.3 }}
        className={cn(
          "w-14 h-20 bg-red-900 border-2 border-tavern-gold/60 flex items-center justify-center relative overflow-hidden card-shadow",
          className
        )}
      >
        {/* Cross-hatch pattern for card back */}
        <div className="absolute inset-1 border border-tavern-gold/20">
          <div
            className="w-full h-full opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(212,175,55,0.3) 3px, rgba(212,175,55,0.3) 4px), repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(212,175,55,0.3) 3px, rgba(212,175,55,0.3) 4px)",
            }}
          />
        </div>
        {/* Center diamond emblem */}
        <div className="w-4 h-4 bg-tavern-gold/20 rotate-45 border border-tavern-gold/30 z-10" />
      </motion.div>
    );
  }

  const isRed = card.suit === "h" || card.suit === "d";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "w-14 h-20 bg-tavern-parchment border-2 border-tavern-dark flex flex-col p-1 items-center justify-between card-shadow",
        className
      )}
    >
      <div
        className={cn(
          "self-start text-[10px] font-bold leading-none",
          isRed ? "text-red-700" : "text-tavern-dark"
        )}
      >
        {card.rank}
      </div>
      <SuitIcon suit={card.suit} />
      <div
        className={cn(
          "self-end text-[10px] font-bold leading-none rotate-180",
          isRed ? "text-red-700" : "text-tavern-dark"
        )}
      >
        {card.rank}
      </div>
    </motion.div>
  );
};
