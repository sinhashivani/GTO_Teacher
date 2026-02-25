"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TavernLayout } from "./TavernLayout";
import { BankrollHeader } from "./BankrollHeader";
import { CharacterCard } from "./CharacterCard";

const OPPONENTS = [
  {
    name: "The Drunk Bard",
    difficulty: "easy" as const,
    description: "Plays loose, calls too much, rarely bluffs.",
    buyIn: 200,
    avatar: "\u{1F3B6}",
  },
  {
    name: "The Cunning Rogue",
    difficulty: "medium" as const,
    description: "Balanced play with occasional tricky moves.",
    buyIn: 500,
    avatar: "\u{1F5E1}",
  },
  {
    name: "The Iron Knight",
    difficulty: "expert" as const,
    description: "Near-perfect GTO. Only the worthy survive.",
    buyIn: 1000,
    avatar: "\u{1F6E1}",
  },
];

export const TavernLobby: React.FC = () => {
  const router = useRouter();

  return (
    <TavernLayout mode="lobby">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <BankrollHeader />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-10 px-6 py-20">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <h1 className="text-xl md:text-2xl text-tavern-gold uppercase tracking-widest text-center text-balance">
            GTO Teacher
          </h1>
          <div className="h-px w-32 bg-tavern-gold/30" />
          <p className="text-[8px] md:text-[9px] text-tavern-gold/50 uppercase tracking-widest text-center">
            Choose your opponent
          </p>
        </motion.div>

        {/* Opponent selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {OPPONENTS.map((opponent, i) => (
            <motion.div
              key={opponent.difficulty}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            >
              <CharacterCard
                {...opponent}
                onClick={() => router.push(`/play?difficulty=${opponent.difficulty}`)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[7px] text-tavern-gold/30 uppercase tracking-widest"
        >
          Win hands to unlock higher tiers
        </motion.p>
      </div>
    </TavernLayout>
  );
};
