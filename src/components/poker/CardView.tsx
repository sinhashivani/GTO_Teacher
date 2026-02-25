import React from "react";
import { Card as CardType } from "@/lib/poker/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardViewProps {
  card?: CardType;
  hidden?: boolean;
  className?: string;
}

const SuitIcon = ({ suit }: { suit: CardType["suit"] }) => {
  const color = (suit === "h" || suit === "d") ? "text-red-600" : "text-black";
  const icons = {
    h: "♥",
    d: "♦",
    s: "♠",
    c: "♣",
  };
  return <span className={cn("text-lg", color)}>{icons[suit]}</span>;
};

export const CardView: React.FC<CardViewProps> = ({ card, hidden, className }) => {
  if (hidden || !card) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "w-12 h-18 bg-red-800 border-2 border-white rounded-sm flex items-center justify-center pixel-border relative overflow-hidden",
          className
        )}
      >
        <div className="absolute inset-1 border border-white/20 flex items-center justify-center">
          <div className="w-4 h-4 bg-white/10 rotate-45" />
        </div>
      </motion.div>
    );
  }

  const isRed = card.suit === "h" || card.suit === "d";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "w-12 h-18 bg-white border-2 border-black rounded-sm flex flex-col p-1 items-center justify-between shadow-md",
        className
      )}
    >
      <div className={cn("self-start text-[10px] font-bold leading-none", isRed ? "text-red-600" : "text-black")}>
        {card.rank}
      </div>
      <SuitIcon suit={card.suit} />
      <div className={cn("self-end text-[10px] font-bold leading-none rotate-180", isRed ? "text-red-600" : "text-black")}>
        {card.rank}
      </div>
    </motion.div>
  );
};
