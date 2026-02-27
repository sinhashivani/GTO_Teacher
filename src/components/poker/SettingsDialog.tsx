"use client";

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserSettings } from "@/lib/db";
import { resetHeroBankroll, resetAllBankrolls } from "@/lib/poker/bankroll";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SettingsDialog: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (settings?.id) {
      await db.settings.update(settings.id, updates);
    }
  };

  const handleResetHero = async () => {
    if (window.confirm("Reset your bankroll? This applies next hand.")) {
      resetHeroBankroll(settings?.startingStack || 1000);
    }
  };

  const handleResetAll = async () => {
    if (window.confirm("Reset ALL bankrolls (including bots)? This applies next hand.")) {
      resetAllBankrolls();
    }
  };

  if (!settings) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-tavern-dark/80 border-tavern-wood hover:bg-tavern-wood transition-colors"
        >
          <Settings className="w-4 h-4 text-tavern-gold" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-tavern-dark border-2 border-tavern-wood text-tavern-gold font-pixel max-h-[90vh] overflow-y-auto tavern-scrollbar">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest text-sm text-tavern-gold">
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5 py-4">
          {/* Feedback Timing */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Coaching Feedback
            </label>
            <div className="flex gap-2">
              {(["immediate", "delayed"] as const).map((timing) => (
                <Button
                  key={timing}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.feedbackTiming === timing
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ feedbackTiming: timing })}
                >
                  {timing}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Difficulty
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["easy", "medium", "expert", "mixed"] as const).map((d) => (
                <Button
                  key={d}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 min-w-[70px] transition-colors",
                    settings.difficulty === d
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ difficulty: d })}
                >
                  {d}
                  {settings.difficulty !== d && <span className="block text-[6px] normal-case">*</span>}
                </Button>
              ))}
            </div>
            <p className="text-[6px] text-tavern-gold/40">* Applies next hand</p>
          </div>

          {/* Starting Stack */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Starting Stack
            </label>
            <div className="flex gap-2 flex-wrap">
              {([100, 500, 1000, 2000, 5000] as const).map((amount) => (
                <Button
                  key={amount}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.startingStack === amount
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ startingStack: amount })}
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Credit Mode */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Credit Mode (Negative Betting)
            </label>
            <div className="flex gap-2">
              {([true, false] as const).map((val) => (
                <Button
                  key={String(val)}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.creditMode === val
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ creditMode: val })}
                >
                  {val ? "On" : "Off"}
                </Button>
              ))}
            </div>
          </div>

          {/* Credit Limit */}
          {settings.creditMode && (
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
                Credit Limit
              </label>
              <div className="flex gap-2 flex-wrap">
                {([-1000, -2000, -5000, -10000] as const).map((limit) => (
                  <Button
                    key={limit}
                    className={cn(
                      "flex-1 uppercase text-[8px] h-8 transition-colors",
                      settings.creditLimit === limit
                        ? "bg-tavern-gold text-tavern-dark"
                        : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                    )}
                    onClick={() => updateSettings({ creditLimit: limit })}
                  >
                    {limit}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Player Count */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Player Count
            </label>
            <div className="flex gap-2">
              {([2, 3, 4, 5, 6] as const).map((n) => (
                <Button
                  key={n}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.playerCount === n
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ playerCount: n })}
                >
                  {n}
                  {settings.playerCount !== n && <span className="block text-[6px] normal-case">*</span>}
                </Button>
              ))}
            </div>
          </div>

          {/* Bankroll Resets */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Bankroll Management
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-tavern-wood/20 border-tavern-wood text-tavern-gold hover:bg-tavern-wood/40 uppercase text-[7px] h-8"
                onClick={handleResetHero}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset Mine
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-tavern-wood/20 border-tavern-wood text-tavern-gold hover:bg-tavern-wood/40 uppercase text-[7px] h-8"
                onClick={handleResetAll}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Reset All
              </Button>
            </div>
          </div>

          {/* Game Speed */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Game Speed
            </label>
            <div className="flex gap-2">
              {(["normal", "fast"] as const).map((speed) => (
                <Button
                  key={speed}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.gameSpeed === speed
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ gameSpeed: speed })}
                >
                  {speed}
                </Button>
              ))}
            </div>
          </div>

          {/* Hand Patterns Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Hand Patterns Guide
            </label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <Button
                  key={String(val)}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.showHandGuide === val
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ showHandGuide: val })}
                >
                  {val ? "Show" : "Hide"}
                </Button>
              ))}
            </div>
          </div>

          {/* Position Labels Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-wider text-tavern-gold/60">
              Position Labels (BTN, UTG, etc.)
            </label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <Button
                  key={String(val)}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.showPositionLabels === val
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ showPositionLabels: val })}
                >
                  {val ? "Show" : "Hide"}
                </Button>
              ))}
            </div>
          </div>

          {/* Leave Game */}
          <div className="pt-2 border-t border-tavern-wood/30 flex flex-col gap-2">
            <Button
              className="w-full bg-tavern-wood/60 text-tavern-gold hover:bg-tavern-wood border border-tavern-wood/40 uppercase text-[8px] h-8"
              onClick={() => {
                if (window.confirm("Leave current hand? This will forfeit the hand.")) {
                  window.dispatchEvent(new CustomEvent('leave-game'));
                }
              }}
            >
              Leave Game
            </Button>
            <Button
              className="w-full bg-red-900/60 text-red-300 hover:bg-red-900 border border-red-800/40 uppercase text-[8px] h-8"
              onClick={() => {
                if (window.confirm("Clear all session stats?")) {
                  db.hands.clear();
                }
              }}
            >
              Reset Session Stats
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
