import React from "react";
import { Card } from "@/lib/poker/types";
import { evaluateHand } from "@/lib/poker/evaluator";

interface HandStrengthProps {
  holeCards: Card[];
  communityCards: Card[];
}

export const HandStrength: React.FC<HandStrengthProps> = ({ holeCards, communityCards }) => {
  if (holeCards.length === 0) return null;
  
  const result = evaluateHand(holeCards, communityCards);
  
  return (
    <div className="bg-black/40 px-3 py-1 pixel-border border border-white/20 text-[10px] uppercase text-white font-bold">
      {result.description}
    </div>
  );
};
