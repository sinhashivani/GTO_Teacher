import React from "react";
import { Card as CardType } from "@/lib/poker/types";
import { CardView } from "./CardView";

interface CommunityCardsProps {
  cards: CardType[];
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card area background */}
      <div className="flex gap-3 px-4 py-3 bg-black/15 border border-tavern-gold/10">
        {[0, 1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            {cards[i] ? (
              <CardView card={cards[i]} delay={i * 0.1} />
            ) : (
              <div className="w-14 h-20 bg-black/10 border-2 border-dashed border-tavern-gold/10 flex items-center justify-center">
                <span className="text-tavern-gold/10 text-xs">{"?"}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
