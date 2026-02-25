import React from "react";
import { cn } from "@/lib/utils";

interface TavernLayoutProps {
  children: React.ReactNode;
  mode?: "lobby" | "table";
}

export const TavernLayout: React.FC<TavernLayoutProps> = ({ children, mode = "table" }) => {
  return (
    <div className="min-h-screen bg-tavern-dark text-tavern-gold font-pixel flex flex-col relative overflow-hidden">
      {/* Ambient stone background */}
      <div className="fixed inset-0 tavern-stone-bg opacity-40 pointer-events-none" />

      {/* Warm vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Corner lantern glows */}
      <div className="fixed top-0 left-0 w-64 h-64 pointer-events-none opacity-30">
        <div
          className="w-full h-full"
          style={{
            background: "radial-gradient(circle at 0% 0%, rgba(212,175,55,0.15) 0%, transparent 60%)",
            animation: "lantern-flicker 5s ease-in-out infinite",
          }}
        />
      </div>
      <div className="fixed top-0 right-0 w-64 h-64 pointer-events-none opacity-30">
        <div
          className="w-full h-full"
          style={{
            background: "radial-gradient(circle at 100% 0%, rgba(212,175,55,0.15) 0%, transparent 60%)",
            animation: "lantern-flicker 6s ease-in-out infinite 1s",
          }}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "relative z-10 flex-1 flex flex-col",
          mode === "lobby" && "items-center justify-center",
          mode === "table" && "items-center"
        )}
      >
        {children}
      </div>
    </div>
  );
};
