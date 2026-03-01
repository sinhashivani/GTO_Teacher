"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CardView } from "./CardView";
import { Card } from "@/lib/poker/types";

export interface BotPerformanceAction {
  type: string;
  stage: string;
  isCharacteristic: boolean;
  timestamp: number;
}

interface BotInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: {
    id: string;
    name: string;
    difficulty: string;
    avatar?: string;
    holeCards?: Card[];
  };
  performance: BotPerformanceAction[];
  heroFolded: boolean;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Novice",
  medium: "Intermediate",
  expert: "Master",
};

const STYLE_DESCRIPTIONS: Record<string, string> = {
  easy: "Loose and unpredictable. Often calls with weak hands and makes erratic bets. Susceptible to bluffs but can stumble into big pots.",
  medium: "Solid and cautious. Plays a standard TAG (Tight-Aggressive) style but lacks advanced deception. Respects big bets.",
  expert: "Balanced and aggressive. Uses pot odds and range balancing. Difficult to exploit and capable of timely bluffs.",
};

export const BotInspectionModal: React.FC<BotInspectionModalProps> = ({
  isOpen,
  onClose,
  bot,
  performance,
  heroFolded,
}) => {
  const showCards = heroFolded || bot.holeCards?.length === 0; // If they are revealed anyway at showdown

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-tavern-dark border-2 border-tavern-wood text-tavern-gold font-pixel max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">{bot.avatar || "👤"}</span>
            {bot.name}
          </DialogTitle>
          <DialogDescription className="text-tavern-tan/80 text-[10px] uppercase">
            Bot Inspection & Analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Metadata Section */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-tavern-tan uppercase mb-1">Skill Level</p>
              <Badge variant="outline" className="border-tavern-gold text-tavern-gold text-[10px]">
                {DIFFICULTY_LABELS[bot.difficulty] || bot.difficulty}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-tavern-tan uppercase mb-1">Status</p>
              <Badge variant="outline" className="border-green-500 text-green-500 text-[10px]">
                Active
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="bg-tavern-wood/20 p-3 rounded border border-tavern-wood/30">
            <p className="text-[10px] text-tavern-tan uppercase mb-2">Play Style</p>
            <p className="text-xs leading-relaxed">
              {STYLE_DESCRIPTIONS[bot.difficulty] || "A mysterious player with unknown tendencies."}
            </p>
          </div>

          {/* Hole Cards - ONLY IF HERO FOLDED */}
          <div className="bg-tavern-wood/10 p-3 rounded border border-tavern-wood/20">
            <p className="text-[10px] text-tavern-tan uppercase mb-2">Current Hole Cards</p>
            {showCards && bot.holeCards && bot.holeCards.length === 2 ? (
              <div className="flex gap-2">
                <CardView card={bot.holeCards[0]} className="w-8 h-12" />
                <CardView card={bot.holeCards[1]} className="w-8 h-12" />
                <div className="ml-2 flex items-center">
                   <p className="text-[8px] text-green-400 italic">Revealed: Hero Folded</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="w-8 h-12 bg-tavern-wood/40 rounded border border-tavern-wood/60 flex items-center justify-center">
                  <span className="text-tavern-gold/30">?</span>
                </div>
                <div className="w-8 h-12 bg-tavern-wood/40 rounded border border-tavern-wood/60 flex items-center justify-center">
                  <span className="text-tavern-gold/30">?</span>
                </div>
                <div className="ml-2 flex items-center">
                   <p className="text-[8px] text-tavern-tan italic">Cards hidden while Hero in hand</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Performance */}
          <div>
            <p className="text-[10px] text-tavern-tan uppercase mb-2">Recent Actions</p>
            <div className="space-y-2">
              {performance.length > 0 ? (
                performance.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] border-b border-tavern-wood/10 pb-1">
                    <div className="flex gap-2">
                      <span className="text-tavern-tan/60">[{act.stage}]</span>
                      <span className="uppercase font-bold">{act.type}</span>
                    </div>
                    {act.isCharacteristic && (
                       <Badge variant="outline" className="bg-blue-900/20 border-blue-500/50 text-blue-400 text-[8px] h-4">
                         Characteristic
                       </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] italic text-tavern-tan/60">No recent actions tracked.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
