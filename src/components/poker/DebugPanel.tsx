"use client";

import React, { useState } from "react";
import { GameState } from "@/lib/poker/types";

function getLegalActions(state: GameState): string[] {
  const actions = ["FOLD"];
  const activePlayer = state.players[state.activePlayerIndex];
  if (!activePlayer) return [];

  const currentMaxBet = Math.max(...state.players.map(p => p.currentBet));
  
  if (activePlayer.currentBet === currentMaxBet) {
    actions.push("CHECK");
  } else {
    actions.push("CALL");
  }
  
  if (activePlayer.stack > 0) {
    actions.push("RAISE");
  }
  
  return actions;
}

interface DebugPanelProps {
  gameState: GameState;
  evaluations?: Record<string, any>;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ gameState, evaluations = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] font-mono text-[10px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-tavern-dark border border-tavern-gold text-tavern-gold px-2 py-1 uppercase shadow-lg"
      >
        {isOpen ? "Close Debug" : "Open Debug"}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-tavern-dark/95 border border-tavern-gold text-tavern-parchment max-w-[300px] max-h-[500px] overflow-auto shadow-2xl">
          <h3 className="text-tavern-gold border-b border-tavern-gold/20 mb-2 pb-1 uppercase font-bold">
            Engine State
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-tavern-gold/60">Stage: </span>
              {gameState.stage}
            </div>
            <div>
              <span className="text-tavern-gold/60">To Act: </span>
              {gameState.activePlayerIndex} (
              {gameState.players[gameState.activePlayerIndex]?.id})
            </div>
            <div>
              <span className="text-tavern-gold/60">Pot: </span>
              {gameState.pot}
            </div>
            
            <div className="mt-4 border-t border-tavern-gold/10 pt-2">
              <h4 className="text-tavern-gold/80 uppercase font-bold mb-1">Players</h4>
              {gameState.players.map((p, i) => (
                <div key={p.id} className="mb-1 border-b border-tavern-gold/5 pb-1 last:border-0">
                  <div className="flex justify-between">
                    <span>[{i}] {p.name} {i === gameState.dealerIndex && "(D)"}</span>
                    <span className="text-tavern-gold">{p.stack}</span>
                  </div>
                  <div>Bet: {p.currentBet} | Folded: {p.isFolded ? "Y" : "N"}</div>
                  {evaluations[p.id] && (
                    <div className="text-[8px] text-tavern-gold/40">
                      Rank: {evaluations[p.id].handClass}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
