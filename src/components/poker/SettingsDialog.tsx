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
        <Button variant="outline" size="icon" className="pixel-border bg-tavern-dark">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-tavern-dark border-2 border-tavern-gold text-tavern-gold font-pixel rounded-none">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest text-xl">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs">Feedback Timing</label>
            <div className="flex gap-2">
              <Button
                variant={settings.feedbackTiming === "immediate" ? "default" : "outline"}
                className="pixel-border flex-1 uppercase text-[10px]"
                onClick={() => updateSettings({ feedbackTiming: "immediate" })}
              >
                Immediate
              </Button>
              <Button
                variant={settings.feedbackTiming === "delayed" ? "default" : "outline"}
                className="pixel-border flex-1 uppercase text-[10px]"
                onClick={() => updateSettings({ feedbackTiming: "delayed" })}
              >
                Delayed
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs">Difficulty</label>
            <div className="flex gap-2">
              {(["easy", "medium", "expert"] as const).map((d) => (
                <Button
                  key={d}
                  variant={settings.difficulty === d ? "default" : "outline"}
                  className="pixel-border flex-1 uppercase text-[8px]"
                  onClick={() => updateSettings({ difficulty: d })}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
