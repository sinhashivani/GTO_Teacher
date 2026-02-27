"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const TERMS = [
  {
    term: "Pot Odds",
    definition: "The ratio of the size of the pot to the size of the bet you must call. If the pot is 100 and you must call 20, your odds are 5:1."
  },
  {
    term: "Equity",
    definition: "Your 'share' of the pot based on your mathematical probability of winning the hand at showdown."
  },
  {
    term: "Range",
    definition: "The set of all possible hands an opponent (or you) could realistically have based on the actions taken so far."
  },
  {
    term: "Blockers",
    definition: "Cards in your hand that make it mathematically less likely for your opponent to hold specific hands (e.g., holding an Ace makes it harder for them to have AA)."
  },
  {
    term: "Implied Odds",
    definition: "The amount of money you expect to win on later streets if you hit your draw."
  }
];

interface GlossaryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  highlightTerm?: string;
}

export const GlossaryDialog: React.FC<GlossaryDialogProps> = ({
  isOpen,
  onOpenChange,
  highlightTerm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-tavern-dark border-4 border-tavern-wood text-tavern-gold font-pixel max-w-md max-h-[70vh] overflow-y-auto tavern-scrollbar">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-[0.2em] text-center border-b border-tavern-wood/30 pb-4">
            Learning Glossary
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {TERMS.map((t) => (
            <div 
              key={t.term} 
              className={cn(
                "p-3 border transition-colors",
                highlightTerm?.toLowerCase() === t.term.toLowerCase()
                  ? "bg-tavern-gold/20 border-tavern-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  : "bg-black/30 border-tavern-wood/20"
              )}
            >
              <h4 className="text-xs font-bold uppercase mb-1 tracking-wider">{t.term}</h4>
              <p className="text-[9px] text-tavern-parchment/70 leading-relaxed italic">
                {t.definition}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
