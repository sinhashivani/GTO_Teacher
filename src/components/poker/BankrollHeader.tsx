"use client";

import React, { useState, useEffect } from "react";
import { Coins, RotateCcw } from "lucide-react";
import { getBankroll, resetHeroBankroll } from "@/lib/poker/bankroll";
import { Button } from "@/components/ui/button";

interface BankrollHeaderProps {
  bankroll?: number;
  tier?: string;
}

export const BankrollHeader: React.FC<BankrollHeaderProps> = ({
  bankroll: propBankroll,
  tier = "Tavern Regular",
}) => {
  const [displayBankroll, setDisplayBankroll] = useState(propBankroll ?? 1000);

  const fetchBankroll = () => {
    if (propBankroll === undefined) {
      setDisplayBankroll(getBankroll('p1'));
    } else {
      setDisplayBankroll(propBankroll);
    }
  };

  useEffect(() => {
    fetchBankroll();
  }, [propBankroll]);

  const handleReset = () => {
    if (window.confirm("Reset balance to 1000?")) {
      resetHeroBankroll(1000);
      fetchBankroll();
      // Optional: window.location.reload() if needed to sync game state
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-tavern-dark/80 border-b-2 border-tavern-wood">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-tavern-gold" />
        <span className="text-tavern-gold text-xs font-bold">{displayBankroll.toLocaleString()}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-tavern-gold/40 hover:text-tavern-gold hover:bg-tavern-gold/10 transition-colors"
          onClick={handleReset}
          title="Reset Balance"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>
      <div className="h-3 w-px bg-tavern-wood" />
      <span className="text-[8px] uppercase tracking-widest text-tavern-gold/60">{tier}</span>
    </div>
  );
};
