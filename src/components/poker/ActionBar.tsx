"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ActionType } from "@/lib/poker/types";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  onAction: (type: ActionType, amount?: number) => void;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  pot: number;
  handStrengthLabel?: string;
  disabled?: boolean;
  isBotThinking?: boolean;
  isShowdown?: boolean;
  showdownWon?: boolean;
  onNextHand?: () => void;
  onShowReport?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onAction,
  canCheck,
  canCall,
  canRaise,
  callAmount,
  minRaise,
  maxRaise,
  pot,
  handStrengthLabel,
  disabled,
  isBotThinking,
  isShowdown,
  showdownWon,
  onNextHand,
  onShowReport,
}) => {
  const [betAmount, setBetAmount] = useState(minRaise);

  // Reset bet when minRaise changes
  React.useEffect(() => {
    setBetAmount(minRaise);
  }, [minRaise]);

  return (
    <div className="w-full wood-panel px-4 py-3 md:px-6 md:py-4">
      {/* Info row */}
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="flex items-center gap-3">
          <span className="text-[8px] uppercase tracking-widest text-tavern-gold/50">Pot</span>
          <span className="text-xs text-tavern-gold font-bold">{pot.toLocaleString()}</span>
        </div>
        {handStrengthLabel && (
          <div className="px-2 py-1 bg-black/30 border border-tavern-gold/20">
            <span className="text-[8px] uppercase text-tavern-parchment tracking-wider">
              {handStrengthLabel}
            </span>
          </div>
        )}
      </div>

      {/* Showdown state */}
      {isShowdown && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex gap-4">
            <button
              onClick={onShowReport}
              className="bg-tavern-dark text-tavern-gold px-6 py-3 text-[10px] font-bold uppercase tracking-wider hover:bg-tavern-wood transition-colors border-2 border-tavern-gold/30"
            >
              View Hand Report
            </button>
            <button
              onClick={onNextHand}
              className="bg-tavern-gold text-tavern-dark px-8 py-3 text-[12px] font-bold uppercase tracking-widest hover:bg-tavern-gold-light transition-colors shadow-lg border-2 border-tavern-dark"
            >
              Next Hand
            </button>
          </div>
        </div>
      )}

      {/* Bot thinking */}
      {isBotThinking && !isShowdown && (
        <div className="flex justify-center py-3">
          <span className="text-xs text-tavern-gold/60 uppercase tracking-widest animate-pulse">
            Opponent is thinking...
          </span>
        </div>
      )}

      {/* Action buttons + slider */}
      {!isShowdown && !isBotThinking && (
        <div className="flex flex-col gap-3">
          {/* Raise slider */}
          {canRaise && (
            <div className="flex items-center gap-3 px-2">
              <span className="text-[8px] text-tavern-gold/40 uppercase w-8">
                {minRaise}
              </span>
              <Slider
                value={[betAmount < minRaise ? minRaise : betAmount]}
                min={minRaise}
                max={maxRaise}
                step={1}
                onValueChange={(vals) => setBetAmount(vals[0])}
                disabled={disabled}
                className="flex-1 cursor-pointer"
              />
              <span className="text-[8px] text-tavern-gold/40 uppercase w-8 text-right">
                {maxRaise}
              </span>
              <span className="text-[10px] text-tavern-gold font-bold min-w-[40px] text-right">
                {betAmount}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              className="bg-red-900 text-red-200 hover:bg-red-800 border-2 border-red-700 uppercase text-[10px] px-5 py-2 h-auto"
              onClick={() => onAction("FOLD")}
              disabled={disabled}
            >
              Fold
            </Button>

            {canCheck && (
              <Button
                className="bg-tavern-dark text-tavern-gold hover:bg-tavern-green border-2 border-tavern-gold uppercase text-[10px] px-5 py-2 h-auto"
                onClick={() => onAction("CHECK")}
                disabled={disabled}
              >
                Check
              </Button>
            )}

            {canCall && (
              <Button
                className="bg-tavern-gold text-tavern-dark hover:bg-tavern-gold-light border-2 border-tavern-gold uppercase text-[10px] px-5 py-2 h-auto font-bold"
                onClick={() => onAction("CALL")}
                disabled={disabled}
              >
                {"Call "}{callAmount > 0 ? `(${callAmount})` : ""}
              </Button>
            )}

            {canRaise && (
              <Button
                className="bg-tavern-gold text-tavern-dark hover:bg-tavern-gold-light border-2 border-tavern-gold uppercase text-[10px] px-5 py-2 h-auto font-bold gold-glow"
                onClick={() => onAction("RAISE", betAmount)}
                disabled={disabled}
              >
                {"Raise "}{betAmount}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
