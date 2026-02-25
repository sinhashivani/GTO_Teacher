import React from "react";
import { Card as CardType } from "@/lib/poker/types";
import { CardView } from "./CardView";

interface CommunityCardsProps {
  cards: CardType[];
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  return (
    <div className="flex gap-2">
      {/* 5 Slots for cards */}
      {[0, 1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          {cards[i] ? (
            <CardView card={cards[i]} className="w-14 h-20" />
          ) : (
            <div
              className="w-14 h-20 bg-black/20 border-2 border-dashed border-white/10 rounded-sm flex items-center justify-center text-white/10 text-xl font-bold"
            >
              ?
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
