import React from "react";

interface TavernLayoutProps {
  children: React.ReactNode;
}

export const TavernLayout: React.FC<TavernLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-tavern-dark text-tavern-gold font-pixel flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl aspect-video relative flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
