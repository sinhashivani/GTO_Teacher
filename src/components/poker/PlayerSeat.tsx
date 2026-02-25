import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Card as CardType } from "@/lib/poker/types";
import { CardView } from "./CardView";

interface PlayerSeatProps {
  name: string;
  chips: number;
  isActive: boolean;
  position: "bottom" | "top" | "left" | "right";
  isDealer?: boolean;
  holeCards?: CardType[];
  isCurrentPlayer?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  name,
  chips,
  isActive,
  position,
  isDealer,
  holeCards,
  isCurrentPlayer,
}) => {
  const positionClasses = {
    bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    top: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    left: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
    right: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
  };

  return (
    <div className={cn("absolute z-10", positionClasses[position])}>
      <Card
        className={cn(
          "w-32 bg-tavern-dark border-2 border-tavern-gold rounded-none overflow-visible",
          isActive && "ring-4 ring-white animate-pulse"
        )}
      >
        <CardContent className="p-2 flex flex-col items-center gap-1 text-[10px]">
          <span className="truncate w-full text-center uppercase text-white font-bold">{name}</span>
          <span className="text-tavern-gold">SB {chips}</span>
          
          {isDealer && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center text-black font-bold">
              D
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cards Display */}
      <div className="flex gap-1 justify-center mt-2">
        {holeCards?.map((card, idx) => (
          <CardView 
            key={idx} 
            card={card} 
            hidden={!isCurrentPlayer} 
            className="w-10 h-14"
          />
        )) || (
          <>
            <div className="w-10 h-14 bg-black/20 border-2 border-dashed border-white/10 rounded-sm" />
            <div className="w-10 h-14 bg-black/20 border-2 border-dashed border-white/10 rounded-sm" />
          </>
        )}
      </div>
    </div>
  );
};
