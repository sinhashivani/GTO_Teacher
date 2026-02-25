"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

interface CharacterCardProps {
  name: string;
  difficulty: "easy" | "medium" | "expert";
  description: string;
  buyIn: number;
  avatar: string;
  locked?: boolean;
  lockReason?: string;
  onClick: () => void;
}

const difficultyColors = {
  easy: {
    border: "border-green-600",
    glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    badge: "bg-green-800 text-green-300",
    label: "Novice",
  },
  medium: {
    border: "border-tavern-gold",
    glow: "hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]",
    badge: "bg-tavern-wood text-tavern-gold",
    label: "Skilled",
  },
  expert: {
    border: "border-red-600",
    glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    badge: "bg-red-900 text-red-300",
    label: "Master",
  },
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  difficulty,
  description,
  buyIn,
  avatar,
  locked = false,
  onClick,
}) => {
  const colors = difficultyColors[difficulty];

  return (
    <motion.button
      onClick={locked ? undefined : onClick}
      whileHover={locked ? {} : { scale: 1.05, y: -4 }}
      whileTap={locked ? {} : { scale: 0.98 }}
      className={cn(
        "relative flex flex-col items-center gap-3 p-5 w-44",
        "bg-tavern-dark/90 border-2 transition-all duration-300",
        colors.border,
        !locked && colors.glow,
        !locked && "cursor-pointer",
        locked && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Avatar */}
      <div className="w-16 h-16 flex items-center justify-center text-3xl bg-tavern-stone border-2 border-tavern-wood">
        {avatar}
      </div>

      {/* Name */}
      <span className="text-[10px] uppercase tracking-wider text-tavern-parchment text-balance text-center leading-relaxed">
        {name}
      </span>

      {/* Difficulty badge */}
      <span className={cn("text-[7px] uppercase tracking-widest px-2 py-1", colors.badge)}>
        {colors.label}
      </span>

      {/* Description */}
      <p className="text-[7px] text-tavern-gold/50 text-center leading-relaxed">
        {description}
      </p>

      {/* Buy-in */}
      <div className="flex items-center gap-1 text-[8px] text-tavern-gold/70">
        <span>Buy-in:</span>
        <span className="text-tavern-gold font-bold">{buyIn}</span>
      </div>

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Lock className="w-6 h-6 text-tavern-gold/40" />
        </div>
      )}
    </motion.button>
  );
};
