"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GameState, HandResult } from "@/lib/poker/types";
import { CardView } from "./CardView";
import { cn } from "@/lib/utils";
import { determineWinners } from "@/lib/poker/evaluator";
import { updateBankroll } from "@/lib/poker/bankroll";

import { ChevronLeft, ChevronRight, BookOpen, Info, RotateCcw } from "lucide-react";
import { GlossaryDialog } from "./GlossaryDialog";

interface RoundReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allHands: any[];
  currentBalance?: number;
}

export const RoundReportModal: React.FC<RoundReportModalProps> = ({
  isOpen,
  onClose,
  allHands = [],
  currentBalance = 1000,
}) => {
  const [currentIndex, setCurrentHandIndex] = React.useState(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = React.useState(false);
  const [highlightTerm, setHighlightTerm] = React.useState("");

  const handleReset = async () => {
    updateBankroll("p1", 1000);
    onClose();
  };

  const openGlossary = (term: string) => {
    setHighlightTerm(term);
    setIsGlossaryOpen(true);
  };

  // Set to latest hand when opened
  React.useEffect(() => {
    if (isOpen && allHands && allHands.length > 0) {
      setCurrentHandIndex(allHands.length - 1);
    }
  }, [isOpen, allHands]);

  if (!isOpen) return null;
  if (!allHands || allHands.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-tavern-dark border-4 border-tavern-wood text-tavern-gold font-pixel max-w-md">
          <div className="py-8 text-center uppercase tracking-widest opacity-50">
            No hands recorded yet.
          </div>
          <button onClick={onClose} className="w-full py-2 bg-tavern-gold text-tavern-dark font-bold uppercase">Close</button>
        </DialogContent>
      </Dialog>
    );
  }

  const hand = allHands[currentIndex];
  if (!hand) return null;

  const gameState = hand.finalState as GameState;
  if (!gameState || !gameState.players) return null;

  // We need evaluations.
  const { evaluationsByPlayerId: evaluations } = determineWinners(gameState.players, gameState.communityCards || []);

  const heroEval = evaluations["p1"];
  const winners = gameState.winners || [];
  const didHeroWin = winners.includes("p1");

  // Identify the best opponent hand to compare against
  const opponentEvals = Object.entries(evaluations)
    .filter(([id]) => id !== "p1")
    .sort((a, b) => {
      const valA = a[1].handValue;
      const valB = b[1].handValue;
      for (let i = 0; i < Math.max(valA.length, valB.length); i++) {
        if ((valA[i] || 0) > (valB[i] || 0)) return -1;
        if ((valA[i] || 0) < (valB[i] || 0)) return 1;
      }
      return 0;
    });

  const bestOpponent = opponentEvals[0];
  const bestOpponentId = bestOpponent?.[0];
  const bestOpponentEval = bestOpponent?.[1];
  const bestOpponentPlayer = gameState.players.find(p => p.id === bestOpponentId);

  // Determine who to label as "The Winner"
  const actualWinnerId = winners[0];
  const isSplitPot = winners.length > 1;
  const winnerPlayer = gameState.players.find(p => p.id === actualWinnerId);
  const winnerEval = evaluations[actualWinnerId];

  return (
    <>
      <GlossaryDialog 
        isOpen={isGlossaryOpen} 
        onOpenChange={setIsGlossaryOpen} 
        highlightTerm={highlightTerm} 
      />
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-tavern-dark border-4 border-tavern-wood text-tavern-gold font-pixel max-w-2xl max-h-[95vh] overflow-y-auto tavern-scrollbar">
          <DialogHeader className="relative">
            <DialogTitle className="uppercase tracking-[0.3em] text-center border-b border-tavern-wood/30 pb-6 text-2xl">
              Hand Report
            </DialogTitle>
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-2 px-4">
              <button 
                disabled={currentIndex <= 0}
                onClick={() => setCurrentHandIndex(i => i - 1)}
                className="p-2 border border-tavern-gold/20 disabled:opacity-20 hover:bg-tavern-gold/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-tavern-gold/60">
                  Hand {currentIndex + 1} of {allHands.length}
                </span>
                <button 
                  onClick={() => openGlossary("")}
                  className="flex items-center gap-1 text-[7px] text-tavern-gold/40 hover:text-tavern-gold mt-1"
                >
                  <BookOpen className="w-2.5 h-2.5" />
                  View Glossary
                </button>
              </div>
              <button 
                disabled={currentIndex >= allHands.length - 1}
                onClick={() => setCurrentHandIndex(i => i + 1)}
                className="p-2 border border-tavern-gold/20 disabled:opacity-20 hover:bg-tavern-gold/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-8 py-6">
            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col gap-1 p-3 bg-black/40 border border-tavern-wood/20">
                <span className="text-[10px] uppercase text-tavern-gold/50">Total Pot</span>
                <span className="text-lg font-bold">{gameState.pot}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-black/40 border border-tavern-wood/20">
                <span className="text-[10px] uppercase text-tavern-gold/50">Winner</span>
                <span className="text-xs uppercase truncate">
                  {isSplitPot ? "Split Pot" : (winnerPlayer?.name || "Unknown")}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-black/40 border border-tavern-wood/20">
                <span className="text-[10px] uppercase text-tavern-gold/50">Result</span>
                <span className={cn("text-lg font-bold uppercase", didHeroWin ? "text-green-400" : "text-red-400")}>
                  {didHeroWin ? "Victory" : "Defeat"}
                </span>
              </div>
            </div>

            {/* Winning Hand Breakdown */}
            <div className="bg-tavern-gold/10 border border-tavern-gold/30 p-4 flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase text-tavern-gold/60 font-bold">Winning Hand Breakdown</span>
              <div className="text-center">
                <p className="text-sm font-bold text-tavern-parchment uppercase">
                  {isSplitPot ? "Best Hands: " : `${winnerPlayer?.name || 'Winner'} won with `}
                  <span className="text-tavern-gold">{winnerEval?.description}</span>
                </p>
                {winnerEval && (
                  <p className="text-[9px] text-tavern-gold/60 mt-1 uppercase tracking-tighter">
                    Winning Cards: {winnerEval.highlightCards.map(c => `${c.rank}${c.suit.toUpperCase()}`).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Cards Display */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3">
                <h4 className="text-xs uppercase tracking-widest text-tavern-gold/60">Community Board</h4>
                <div className="flex gap-2 p-2 bg-black/20 border border-tavern-wood/10">
                  {gameState.communityCards.map((card, i) => (
                    <CardView 
                      key={i} 
                      card={card} 
                      className="w-12 h-16" 
                      highlighted={winnerEval?.highlightCards.some(hc => hc.rank === card.rank && hc.suit === card.suit)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col items-center gap-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-tavern-gold/60">Your Hand</h4>
                  <div className="flex gap-2">
                    {gameState.players.find(p => p.id === "p1")?.holeCards.map((card, i) => (
                      <CardView 
                        key={i} 
                        card={card} 
                        className="w-12 h-16" 
                        highlighted={heroEval?.highlightCards.some(hc => hc.rank === card.rank && hc.suit === card.suit)}
                      />
                    ))}
                  </div>
                  {heroEval && (
                    <p className="text-[9px] text-center italic text-tavern-parchment/80 max-w-[150px]">
                      {heroEval.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-tavern-gold/60">
                    {didHeroWin ? "Best Opponent" : "Winner"} ({bestOpponentPlayer?.name || "Opponent"})
                  </h4>
                  <div className="flex gap-2">
                    {bestOpponentPlayer?.holeCards.map((card, i) => (
                      <CardView 
                        key={i} 
                        card={card} 
                        className="w-12 h-16" 
                        highlighted={bestOpponentEval?.highlightCards.some(hc => hc.rank === card.rank && hc.suit === card.suit)}
                      />
                    ))}
                  </div>
                  {bestOpponentEval && (
                    <p className="text-[9px] text-center italic text-tavern-parchment/80 max-w-[150px]">
                      {bestOpponentEval.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* GTO Analysis Section */}
          <div className="flex flex-col gap-4 p-4 bg-tavern-wood/10 border-2 border-tavern-gold/30">
            <h4 className="text-xs uppercase tracking-[0.2em] border-b border-tavern-gold/20 pb-2 flex justify-between items-center text-tavern-gold">
              GTO Performance
              <span className="text-[7px] text-tavern-gold/40">Hand {currentIndex + 1} Analysis</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-2 bg-black/20 border border-tavern-wood/10">
                <span className="text-[8px] uppercase text-tavern-gold/50">Accuracy Score</span>
                <span className={cn(
                  "text-sm font-bold",
                  hand.accuracyScore > 80 ? "text-green-400" : hand.accuracyScore > 50 ? "text-yellow-400" : "text-red-400"
                )}>
                  {Math.round(hand.accuracyScore)}%
                </span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-black/20 border border-tavern-wood/10">
                <span className="text-[8px] uppercase text-tavern-gold/50">EV Loss (Delta)</span>
                <span className="text-sm font-bold text-tavern-gold">
                  {hand.evDelta !== undefined ? hand.evDelta.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>

            {hand.leaks && hand.leaks.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[8px] uppercase text-red-400/60 font-bold">Identified Leaks:</span>
                <div className="flex flex-wrap gap-2">
                  {hand.leaks.map((leak: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-950/40 border border-red-900/50 text-red-300 text-[7px] uppercase tracking-tighter">
                      {leak}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Log & GTO Breakdown */}
            <div className="flex flex-col gap-4 p-4 bg-tavern-gold/5 border-2 border-tavern-gold/20">
              <h4 className="text-xs uppercase tracking-[0.2em] border-b border-tavern-gold/10 pb-2 flex justify-between items-center">
                Action Analysis
                <span className="text-[7px] text-tavern-gold/40">Powered by Expert GTO Baseline</span>
              </h4>
              <div className="flex flex-col gap-6">
                {gameState.actionLog?.filter(a => a.playerId === "p1").map((action, idx) => (
                  <div key={idx} className="flex flex-col gap-3 border-b border-tavern-gold/5 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase">{action.type}</span>
                          {action.amount !== undefined && <span className="text-[10px] text-tavern-gold/60">{action.amount}</span>}
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 border text-[7px] uppercase font-bold w-fit mt-1",
                          action.deviation 
                            ? "bg-red-900/20 border-red-900 text-red-400" 
                            : "bg-tavern-green/20 border-tavern-green text-green-400"
                        )}>
                          {action.deviation ? `Deviation (Recommended: ${action.coaching?.recommended || action.deviation.recommended})` : "Optimal Play"}
                        </div>
                      </div>
                      <div className="text-[8px] bg-tavern-wood/20 border border-tavern-wood/40 px-2 py-1 flex items-center gap-1">
                        <Info className="w-2.5 h-2.5" />
                        Confidence: {action.coaching?.confidence || 'baseline'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-black/20 p-2 border border-tavern-wood/10">
                        <span className="text-[8px] uppercase text-tavern-gold/60 font-bold block mb-1">Rational:</span>
                        <p className="text-[9px] text-tavern-parchment/80 leading-relaxed italic">
                          {action.coaching?.why || action.deviation?.rationale || "Your play aligns with the standard expert model."}
                        </p>
                      </div>

                      {action.coaching?.whatChanges && (
                        <div className="px-2">
                          <span className="text-[7px] uppercase text-tavern-gold/40 font-bold block mb-0.5">Tactical Adjustments:</span>
                          <p className="text-[8px] text-tavern-parchment/60 leading-snug">
                            {action.coaching.whatChanges}
                          </p>
                        </div>
                      )}

                      {action.coaching?.alternatives && action.coaching.alternatives.length > 0 && (
                        <div className="px-2">
                          <span className="text-[7px] uppercase text-tavern-gold/40 font-bold block mb-1">Alternative Lines:</span>
                          {action.coaching.alternatives.map((alt, i) => (
                            <div key={i} className="text-[8px] text-tavern-parchment/50 pl-2 border-l border-tavern-gold/20 mb-1 last:mb-0">
                              <span className="font-bold text-tavern-gold/60">{alt.type}:</span> {alt.reason}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!gameState.actionLog || gameState.actionLog.filter(a => a.playerId === "p1").length === 0) && (
                  <p className="text-[9px] text-tavern-parchment/40 italic text-center py-2">
                    No actions taken (Hero folded preflop or was all-in).
                  </p>
                )}
              </div>
            </div>
          </div>

          {currentBalance <= 0 && (
            <div className="mt-8 p-6 bg-red-950/20 border-2 border-red-900/50 flex flex-col items-center gap-4 text-center">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Balance Depleted</span>
                <p className="text-[10px] text-red-300/70 italic">To continue your training, review your performance above then reset your balance.</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Balance to 1000 & Restart
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-tavern-gold text-tavern-dark font-bold uppercase tracking-widest hover:bg-tavern-gold-light transition-colors mt-4"
          >
            Back to Tavern
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};
