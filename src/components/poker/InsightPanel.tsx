import React from "react";
import { GameState, Card } from "@/lib/poker/types";
import { Badge } from "@/components/ui/badge";

interface InsightPanelProps {
  state: GameState;
  opponentId: string;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({ state, opponentId }) => {
  const opponent = state.players.find(p => p.id === opponentId);
  if (!opponent) return null;

  // Heuristic-based range categories for v1
  const getLikelyRange = () => {
    if (opponent.currentBet > state.pot) return ["Overpairs", "Sets", "Bluffs"];
    if (opponent.currentBet > 0) return ["Strong Pairs", "Draws", "Middle Pairs"];
    return ["Any Hand", "Air", "Weak Pairs"];
  };

  return (
    <div className="flex flex-col gap-1 items-center bg-black/40 p-2 pixel-border border border-white/10">
      <div className="text-[8px] text-zinc-400 uppercase tracking-widest font-pixel">Possible Range</div>
      <div className="flex flex-wrap gap-1 justify-center max-w-[150px]">
        {getLikelyRange().map(r => (
          <Badge key={r} variant="outline" className="text-[7px] p-1 h-auto leading-none border-white/20 text-tavern-gold font-pixel">
            {r}
          </Badge>
        ))}
      </div>
    </div>
  );
};
