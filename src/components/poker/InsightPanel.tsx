import React from "react";
import { GameState } from "@/lib/poker/types";
import { Badge } from "@/components/ui/badge";

interface InsightPanelProps {
  state: GameState;
  opponentId: string;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({ state, opponentId }) => {
  const opponent = state.players.find(p => p.id === opponentId);
  if (!opponent) return null;

  const getLikelyRange = () => {
    if (opponent.currentBet > state.pot) return ["Overpairs", "Sets", "Bluffs"];
    if (opponent.currentBet > 0) return ["Strong Pairs", "Draws", "Middle Pairs"];
    return ["Any Hand", "Air", "Weak Pairs"];
  };

  return (
    <div className="flex flex-col gap-2 items-center p-3 bg-black/20 border border-tavern-wood/20">
      <div className="text-[7px] text-tavern-gold/40 uppercase tracking-widest">
        Possible Range
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {getLikelyRange().map(r => (
          <Badge
            key={r}
            variant="outline"
            className="text-[7px] px-2 py-0.5 h-auto leading-none border-tavern-gold/20 text-tavern-gold font-pixel"
          >
            {r}
          </Badge>
        ))}
      </div>
    </div>
  );
};
