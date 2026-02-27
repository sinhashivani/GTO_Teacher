"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";
import { CardView } from "./CardView";
import { Card } from "@/lib/poker/card";

const HAND_TEMPLATES = [
  { 
    name: "Straight Flush", 
    description: "Consecutive ranks, same suit",
    cards: [new Card('5', 's'), new Card('4', 's'), new Card('3', 's'), new Card('2', 's'), new Card('A', 's')]
  },
  { 
    name: "Four of a Kind", 
    description: "Four cards of same rank",
    cards: [new Card('A', 's'), new Card('A', 'h'), new Card('A', 'd'), new Card('A', 'c'), new Card('K', 's')]
  },
  { 
    name: "Full House", 
    description: "Three of a kind + pair",
    cards: [new Card('K', 's'), new Card('K', 'h'), new Card('K', 'd'), new Card('Q', 's'), new Card('Q', 'h')]
  },
  { 
    name: "Flush", 
    description: "Five cards, same suit",
    cards: [new Card('A', 'h'), new Card('J', 'h'), new Card('8', 'h'), new Card('4', 'h'), new Card('2', 'h')]
  },
  { 
    name: "Straight", 
    description: "Five consecutive ranks",
    cards: [new Card('T', 's'), new Card('9', 'h'), new Card('8', 'd'), new Card('7', 'c'), new Card('6', 's')]
  },
  { 
    name: "Three of a Kind", 
    description: "Three cards of same rank",
    cards: [new Card('J', 's'), new Card('J', 'h'), new Card('J', 'd'), new Card('A', 's'), new Card('5', 'h')]
  },
  { 
    name: "Two Pair", 
    description: "Two different pairs",
    cards: [new Card('Q', 's'), new Card('Q', 'h'), new Card('7', 'd'), new Card('7', 'c'), new Card('2', 's')]
  },
  { 
    name: "Pair", 
    description: "Two cards of same rank",
    cards: [new Card('A', 's'), new Card('A', 'h'), new Card('K', 'd'), new Card('J', 'c'), new Card('3', 's')]
  },
  { 
    name: "High Card", 
    description: "Highest card only",
    cards: [new Card('A', 's'), new Card('Q', 'h'), new Card('9', 'd'), new Card('5', 'c'), new Card('3', 's')]
  },
];

export const HandRankingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "g" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 p-3 bg-tavern-dark border-2 border-tavern-gold text-tavern-gold hover:bg-tavern-wood transition-colors shadow-lg group"
        title="Hand Rankings (G)"
      >
        <BookOpen className="w-5 h-5" />
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-tavern-gold/30">
          Rankings (G)
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-tavern-dark border-4 border-tavern-wood text-tavern-gold font-pixel max-w-xl max-h-[85vh] overflow-y-auto tavern-scrollbar">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-[0.2em] text-center border-b border-tavern-wood/30 pb-4">
              Hand Rankings
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {HAND_TEMPLATES.map((t) => (
              <div key={t.name} className="p-3 bg-black/30 border border-tavern-wood/20 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-tavern-wood/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-wider">{t.name}</span>
                  <p className="text-[9px] text-tavern-parchment/60 italic">{t.description}</p>
                </div>
                <div className="flex gap-1 justify-center">
                  {t.cards.map((c, i) => (
                    <div key={i} className="scale-75 origin-center">
                      <CardView card={c} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-center text-tavern-gold/40 uppercase tracking-widest mt-2">
            Press [G] to toggle
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
