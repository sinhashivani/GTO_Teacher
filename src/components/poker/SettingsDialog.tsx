"use client";

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserSettings } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const SettingsDialog: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (settings?.id) {
      await db.settings.update(settings.id, updates);
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
      <DialogContent className="bg-tavern-dark border-2 border-tavern-wood text-tavern-gold font-pixel">
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
            <div className="flex gap-2">
              {(["easy", "medium", "expert"] as const).map((d) => (
                <Button
                  key={d}
                  className={cn(
                    "flex-1 uppercase text-[8px] h-8 transition-colors",
                    settings.difficulty === d
                      ? "bg-tavern-gold text-tavern-dark"
                      : "bg-tavern-dark text-tavern-gold/50 border border-tavern-wood hover:bg-tavern-wood/30"
                  )}
                  onClick={() => updateSettings({ difficulty: d })}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <div className="pt-2 border-t border-tavern-wood/30">
            <Button
              className="w-full bg-red-900/60 text-red-300 hover:bg-red-900 border border-red-800/40 uppercase text-[8px] h-8"
              onClick={() => db.hands.clear()}
            >
              Reset Session Stats
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
