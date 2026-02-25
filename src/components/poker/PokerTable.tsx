import React from "react";
import { cn } from "@/lib/utils";

interface PokerTableProps {
  children?: React.ReactNode;
  className?: string;
  pot?: number;
}

export const PokerTable: React.FC<PokerTableProps> = ({ children, className, pot }) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-3xl aspect-[2/1] felt-texture wood-border rounded-[100px] flex flex-col items-center justify-center overflow-visible",
        className
      )}
    >
      {/* Inner rail line */}
      <div className="absolute inset-3 border-2 border-black/15 rounded-[88px] pointer-events-none" />
      <div className="absolute inset-5 border border-tavern-gold/5 rounded-[80px] pointer-events-none" />

      {/* Felt shading */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(0,0,0,0.25)_100%)] pointer-events-none rounded-[100px]" />

      {/* Pot display */}
      {pot !== undefined && pot > 0 && (
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
          <div className="text-[8px] uppercase text-tavern-gold/50 tracking-widest">Pot</div>
          <div className="text-sm text-tavern-gold font-bold px-3 py-1 bg-black/30 border border-tavern-gold/20">
            {pot.toLocaleString()}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
