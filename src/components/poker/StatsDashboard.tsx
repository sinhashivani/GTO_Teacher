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
import { BarChart2 } from "lucide-react";

export const StatsDashboard: React.FC = () => {
  const hands = useLiveQuery(() => db.hands.toArray());

  if (!hands) return null;

  const totalHands = hands.length;
  const totalProfit = hands.reduce((sum, h) => sum + h.profit, 0);
  const handsWon = hands.filter((h) => h.won).length;
  const avgAccuracy = totalHands > 0 
    ? hands.reduce((sum, h) => sum + h.accuracyScore, 0) / totalHands 
    : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="pixel-border bg-tavern-dark">
          <BarChart2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-tavern-dark border-2 border-tavern-gold text-tavern-gold font-pixel rounded-none max-w-md">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest text-xl">Session Stats</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center p-3 bg-black/40 border border-white/10">
            <span className="text-[8px] uppercase text-zinc-400">Total Hands</span>
            <span className="text-xl font-bold">{totalHands}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-black/40 border border-white/10">
            <span className="text-[8px] uppercase text-zinc-400">Profit/Loss</span>
            <span className={totalProfit >= 0 ? "text-green-500 text-xl font-bold" : "text-red-500 text-xl font-bold"}>
              {totalProfit > 0 ? "+" : ""}{totalProfit}
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-black/40 border border-white/10">
            <span className="text-[8px] uppercase text-zinc-400">Win Rate</span>
            <span className="text-xl font-bold">{totalHands > 0 ? Math.round((handsWon / totalHands) * 100) : 0}%</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-black/40 border border-white/10">
            <span className="text-[8px] uppercase text-zinc-400">GTO Accuracy</span>
            <span className="text-xl font-bold">{Math.round(avgAccuracy)}%</span>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          className="pixel-border w-full uppercase text-[10px] mt-2"
          onClick={() => db.hands.clear()}
        >
          Reset Session
        </Button>
      </DialogContent>
    </Dialog>
  );
};
