import { Suspense } from "react";
import { GameController } from "@/components/poker/GameController";

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-tavern-dark flex items-center justify-center font-pixel text-tavern-gold">
          <span className="animate-pulse text-xs uppercase tracking-widest">Loading...</span>
        </div>
      }
    >
      <GameController />
    </Suspense>
  );
}
