"use client";

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { CardView } from "./CardView";

export const HandHistoryViewer: React.FC = () => {
  const hands = useLiveQuery(() => db.hands.reverse().limit(10).toArray());

  if (!hands) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="pixel-border bg-tavern-dark">
          <History className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-tavern-dark border-2 border-tavern-gold text-tavern-gold font-pixel rounded-none max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest text-xl">Recent Hands</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {hands.length === 0 && <div className="text-center text-xs opacity-50">No hands played yet.</div>}
          {hands.map((hand) => (
            <div key={hand.id} className="p-3 bg-black/40 border border-white/10 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[8px] uppercase">
                <span className={hand.won ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                  {hand.won ? "Victory" : "Defeat"} ({hand.profit > 0 ? "+" : ""}{hand.profit})
                </span>
                <span className="text-zinc-500">{new Date(hand.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[6px] uppercase opacity-50 text-center">Your Hand</span>
                  <div className="flex gap-1">
                    {hand.finalState.players.find(p => p.id === 'p1')?.holeCards.map((c, i) => (
                      <CardView key={i} card={c} className="w-6 h-9 text-[6px] p-0.5" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                   <span className="text-[6px] uppercase opacity-50 text-center">Board</span>
                   <div className="flex gap-1 justify-center">
                    {hand.finalState.communityCards.map((c, i) => (
                      <CardView key={i} card={c} className="w-6 h-9 text-[6px] p-0.5" />
                    ))}
                    {[...Array(5 - hand.finalState.communityCards.length)].map((_, i) => (
                      <div key={i} className="w-6 h-9 bg-black/20 border border-dashed border-white/10 rounded-sm" />
                    ))}
                   </div>
                </div>
              </div>
              <div className="text-[6px] uppercase text-zinc-500 text-right">
                Accuracy: {Math.round(hand.accuracyScore)}%
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
