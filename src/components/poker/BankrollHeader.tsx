"use client";

import React from "react";
import { Coins } from "lucide-react";

interface BankrollHeaderProps {
  bankroll?: number;
  tier?: string;
}

export const BankrollHeader: React.FC<BankrollHeaderProps> = ({
  bankroll = 10000,
  tier = "Tavern Regular",
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-tavern-dark/80 border-b-2 border-tavern-wood">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-tavern-gold" />
        <span className="text-tavern-gold text-xs">{bankroll.toLocaleString()}</span>
      </div>
      <div className="h-3 w-px bg-tavern-wood" />
      <span className="text-[8px] uppercase tracking-widest text-tavern-gold/60">{tier}</span>
    </div>
  );
};
