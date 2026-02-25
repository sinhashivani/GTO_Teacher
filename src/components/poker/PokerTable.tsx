import React from "react";
import { cn } from "@/lib/utils";

interface PokerTableProps {
  children?: React.ReactNode;
  className?: string;
}

export const PokerTable: React.FC<PokerTableProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative w-3/4 h-3/4 bg-tavern-green wood-border rounded-[100px] flex items-center justify-center overflow-visible",
        className
      )}
    >
      {/* Table Inner Shadow/Detail */}
      <div className="absolute inset-4 border-4 border-black/20 rounded-[80px] pointer-events-none" />
      
      {/* Table Felt Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_20%,_rgba(0,0,0,0.2)_100%)] pointer-events-none rounded-[100px]" />

      {children}
    </div>
  );
};
