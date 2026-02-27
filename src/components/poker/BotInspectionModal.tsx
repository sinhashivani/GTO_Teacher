import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card as CardType } from "@/lib/poker/types";
import { CardView } from "./CardView";
import { BotDifficulty } from "@/lib/poker/bot";
import { cn } from "@/lib/utils";

export interface BotPerformanceAction {
  type: string;
  stage: string;
  isCharacteristic: boolean;
  timestamp: number;
}

export interface BotMetadata {
  id: string;
  name: string;
  avatar: string;
  difficulty: BotDifficulty;
  playStyle: string;
  recentActions: BotPerformanceAction[];
  holeCards?: CardType[];
}

interface BotInspectionModalProps {
  bot: BotMetadata | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  heroFolded: boolean;
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  easy: "Loose and unpredictable. This player loves to see flops and will often chase draws regardless of the price. Prone to 'curiosity' calls.",
  medium: "Solid but predictable. Plays a tight-passive game. They know hand rankings but lack the aggression to maximize value or bluff effectively.",
  expert: "Balanced and calculated. Uses pot odds and positional awareness. Capable of both thin value bets and well-timed bluffs.",
};

export const BotInspectionModal: React.FC<BotInspectionModalProps> = ({
  bot,
  isOpen,
  onOpenChange,
  heroFolded,
}) => {
  if (!bot) return null;

  const showCards = heroFolded || false;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-tavern-dark border-2 border-tavern-wood text-tavern-parchment font-pixel sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-tavern-gold uppercase tracking-widest text-lg">
            <span className="text-2xl">{bot.avatar}</span>
            {bot.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metadata Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase text-tavern-gold/60">Expertise</span>
              <Badge className={cn(
                "uppercase text-[9px]",
                bot.difficulty === 'expert' ? "bg-red-900 text-red-100" :
                bot.difficulty === 'medium' ? "bg-blue-900 text-blue-100" :
                "bg-green-900 text-green-100"
              )}>
                {bot.difficulty}
              </Badge>
            </div>
            <p className="text-[11px] leading-relaxed italic border-l-2 border-tavern-gold/20 pl-3 py-1">
              "{STYLE_DESCRIPTIONS[bot.difficulty as string] || STYLE_DESCRIPTIONS.medium}"
            </p>
          </div>

          {/* Hole Cards Reveal */}
          <div className="p-4 bg-black/40 border border-tavern-wood/30 rounded-lg">
            <h3 className="text-[10px] uppercase text-tavern-gold mb-3 text-center">Current Hand</h3>
            <div className="flex justify-center gap-3">
              {bot.holeCards && showCards ? (
                bot.holeCards.map((card, idx) => (
                  <CardView key={idx} card={card} className="w-14 h-20" />
                ))
              ) : (
                <>
                  <div className="w-14 h-20 bg-tavern-wood/20 border-2 border-dashed border-tavern-gold/20 flex items-center justify-center">
                    <span className="text-[8px] text-center px-1 opacity-40 uppercase">Fold to reveal</span>
                  </div>
                  <div className="w-14 h-20 bg-tavern-wood/20 border-2 border-dashed border-tavern-gold/20 flex items-center justify-center">
                    <span className="text-[8px] text-center px-1 opacity-40 uppercase">Fold to reveal</span>
                  </div>
                </>
              )}
            </div>
            {!showCards && (
              <p className="text-[9px] text-center mt-3 text-tavern-gold/40 uppercase">
                Privacy Rule: Hero must fold to see bot cards.
              </p>
            )}
          </div>

          {/* Recent Performance */}
          <div className="space-y-3">
            <h3 className="text-[10px] uppercase text-tavern-gold border-b border-tavern-gold/20 pb-1">Recent Tendencies</h3>
            <div className="space-y-2">
              {bot.recentActions.length > 0 ? (
                bot.recentActions.map((action, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-tavern-wood/10 border border-tavern-wood/20">
                    <div className="flex flex-col">
                      <span className="uppercase font-bold text-tavern-gold">{action.type}</span>
                      <span className="text-[8px] opacity-60 uppercase">{action.stage}</span>
                    </div>
                    {action.isCharacteristic ? (
                      <Badge variant="outline" className="text-[7px] border-tavern-gold/40 text-tavern-gold uppercase h-4 px-1">
                        Typical
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[7px] border-tavern-parchment/40 text-tavern-parchment/60 uppercase h-4 px-1">
                        Outlier
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[9px] text-center py-4 opacity-40 uppercase italic">No data yet this session</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
