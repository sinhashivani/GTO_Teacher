import React from "react";
import { cn } from "@/lib/utils";
import { Card as CardType } from "@/lib/poker/types";
import { CardView } from "./CardView";

interface PlayerSeatProps {
  name: string;
  chips: number;
  isActive: boolean;
  position: "bottom" | "top" | "left" | "right" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  isDealer?: boolean;
  isBigBlind?: boolean;
  isSmallBlind?: boolean;
  positionLabel?: string;
  showPositionLabels?: boolean;
  holeCards?: CardType[];
  isCurrentPlayer?: boolean;
  currentBet?: number;
  isFolded?: boolean;
  avatar?: string;
  lastAction?: string;
  highlightedCards?: CardType[];
}

const positionMap = {
  bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-[60%]",
  top: "top-0 left-1/2 -translate-x-1/2 -translate-y-[60%]",
  left: "left-0 top-1/2 -translate-y-1/2 -translate-x-[60%]",
  right: "right-0 top-1/2 -translate-y-1/2 translate-x-[60%]",
  topLeft: "top-0 left-[20%] -translate-x-1/2 -translate-y-[60%]",
  topRight: "top-0 left-[80%] -translate-x-1/2 -translate-y-[60%]",
  bottomLeft: "bottom-0 left-[20%] -translate-x-1/2 translate-y-[60%]",
  bottomRight: "bottom-0 left-[80%] -translate-x-1/2 translate-y-[60%]",
};

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  name,
  chips,
  isActive,
  position,
  isDealer,
  isBigBlind,
  isSmallBlind,
  positionLabel,
  showPositionLabels = true,
  holeCards,
  isCurrentPlayer,
  currentBet,
  isFolded,
  avatar,
  lastAction,
  highlightedCards = [],
}) => {
  const isBottom = position === "bottom";

  const isCardHighlighted = (card: CardType) => {
    return highlightedCards.some(hc => hc.rank === card.rank && hc.suit === card.suit);
  };

  return (
    <div className={cn("absolute z-10", positionMap[position])}>
      <div className="flex flex-col items-center gap-1.5">
        {/* Cards above for bottom player, below for top player */}
        {!isBottom && (
          <div className="flex gap-1 justify-center mb-1">
            {holeCards?.map((card, idx) => (
              <CardView
                key={idx}
                card={card}
                hidden={!isCurrentPlayer}
                className="w-10 h-14"
                highlighted={isCardHighlighted(card)}
              />
            )) || (
              <>
                <div className="w-10 h-14 bg-black/20 border border-dashed border-tavern-gold/10" />
                <div className="w-10 h-14 bg-black/20 border border-dashed border-tavern-gold/10" />
              </>
            )}
          </div>
        )}

        {/* Seat card */}
        <div
          className={cn(
            "relative flex flex-col items-center gap-1 px-3 py-2 bg-tavern-dark/90 border-2 min-w-[120px] transition-all duration-300",
            isActive
              ? "border-tavern-gold gold-glow"
              : "border-tavern-wood/60",
            isFolded && "opacity-40"
          )}
          style={isActive ? { animation: "gold-pulse 2s ease-in-out infinite" } : {}}
        >
          {/* Last action badge */}
          {lastAction && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-tavern-gold text-tavern-dark text-[8px] font-bold uppercase border border-tavern-dark shadow-md z-20">
              {lastAction}
            </div>
          )}

          {/* Avatar + Name row */}
          <div className="flex items-center gap-2 w-full">
            {avatar && (
              <span className="text-sm">{avatar}</span>
            )}
            <span className="truncate text-[9px] uppercase tracking-wide text-tavern-parchment font-bold">
              {name}
            </span>
          </div>

          {/* Chips */}
          <span className="text-[10px] text-tavern-gold">
            {chips.toLocaleString()}
          </span>

          {/* Current bet indicator */}
          {currentBet !== undefined && currentBet > 0 && (
            <span className="text-[8px] text-tavern-gold/60">
              {"Bet: "}{currentBet}
            </span>
          )}

          {/* Position badges */}
          <div className="absolute -top-2 -right-2 flex gap-0.5">
            {showPositionLabels && positionLabel && (
              <div className="w-5 h-5 bg-tavern-gold border border-tavern-dark flex items-center justify-center text-tavern-dark text-[7px] font-bold">
                {positionLabel}
              </div>
            )}
            {isDealer && (
              <div className="w-5 h-5 bg-tavern-parchment border border-tavern-dark flex items-center justify-center text-tavern-dark text-[8px] font-bold">
                D
              </div>
            )}
            {isSmallBlind && (
              <div className="w-5 h-5 bg-tavern-wood border border-tavern-dark flex items-center justify-center text-tavern-gold text-[7px] font-bold">
                SB
              </div>
            )}
            {isBigBlind && (
              <div className="w-5 h-5 bg-tavern-wood border border-tavern-dark flex items-center justify-center text-tavern-gold text-[7px] font-bold">
                BB
              </div>
            )}
          </div>
        </div>

        {/* Cards below for bottom player */}
        {isBottom && (
          <div className="flex gap-1 justify-center mt-1">
            {holeCards?.map((card, idx) => (
              <CardView
                key={idx}
                card={card}
                hidden={!isCurrentPlayer}
                className="w-12 h-[68px]"
                highlighted={isCardHighlighted(card)}
              />
            )) || (
              <>
                <div className="w-12 h-[68px] bg-black/20 border border-dashed border-tavern-gold/10" />
                <div className="w-12 h-[68px] bg-black/20 border border-dashed border-tavern-gold/10" />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
