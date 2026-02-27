"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Eye, History, BarChart2 } from "lucide-react";
import { GameState } from "@/lib/poker/types";
import { InsightPanel } from "./InsightPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

type Tab = "range" | "history" | "stats";

interface RightDrawerPanelProps {
  gameState: GameState;
  opponentId: string;
  handsPlayed?: number;
  winRate?: number;
  profit?: number;
  accuracy?: number;
  evaluations?: Record<string, any>;
}

export const RightDrawerPanel: React.FC<RightDrawerPanelProps> = ({
  gameState,
  opponentId,
  handsPlayed = 0,
  winRate = 0,
  profit = 0,
  accuracy = 0,
  evaluations = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("range");
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  const tabs: { id: Tab; icon: React.ReactNode; label: string; hidden?: boolean }[] = [
    { id: "range", icon: <Eye className="w-3 h-3" />, label: "Range" },
    { id: "stats", icon: <BarChart2 className="w-3 h-3" />, label: "Stats" },
    { id: "history", icon: <History className="w-3 h-3" />, label: "History" },
  ];

  const visibleTabs = tabs.filter(t => !t.hidden);

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-30 px-1 py-4 bg-tavern-wood border-2 border-r-0 border-tavern-gold/30 transition-all",
          isOpen && "right-[260px]"
        )}
      >
        {isOpen ? (
          <ChevronRight className="w-3 h-3 text-tavern-gold" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-tavern-gold" />
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 260 }}
            animate={{ x: 0 }}
            exit={{ x: 260 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[260px] z-20 bg-tavern-dark/95 border-l-2 border-tavern-wood flex flex-col tavern-scrollbar overflow-y-auto"
          >
            {/* Tab buttons */}
            <div className="flex border-b border-tavern-wood">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 text-[7px] uppercase tracking-wider transition-colors",
                    activeTab === tab.id
                      ? "text-tavern-gold bg-tavern-wood/30 border-b-2 border-tavern-gold"
                      : "text-tavern-gold/40 hover:text-tavern-gold/60"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 p-3">
              {activeTab === "range" && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[8px] uppercase tracking-widest text-tavern-gold/60 border-b border-tavern-wood/30 pb-2">
                    Opponent Range
                  </h3>
                  <InsightPanel state={gameState} opponentId={opponentId} />
                </div>
              )}

              {activeTab === "stats" && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[8px] uppercase tracking-widest text-tavern-gold/60 border-b border-tavern-wood/30 pb-2">
                    Session Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Hands", value: handsPlayed.toString() },
                      { label: "Win Rate", value: `${winRate}%` },
                      { label: "Profit", value: `${profit > 0 ? "+" : ""}${profit}`, color: profit >= 0 ? "text-green-400" : "text-red-400" },
                      { label: "GTO Acc.", value: `${accuracy}%` },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center p-2 bg-black/30 border border-tavern-wood/20"
                      >
                        <span className="text-[7px] uppercase text-tavern-gold/40">{stat.label}</span>
                        <span className={cn("text-xs font-bold text-tavern-gold", stat.color)}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[8px] uppercase tracking-widest text-tavern-gold/60 border-b border-tavern-wood/30 pb-2">
                    Recent Hands
                  </h3>
                  <p className="text-[8px] text-tavern-gold/30 text-center py-4">
                    Hand history loads after playing hands
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
