"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PokerGame } from "@/lib/poker/state-machine";
import { handleAction } from "@/lib/poker/betting";
import { GameState, ActionType, Action } from "@/lib/poker/types";
import { db, ensureSettings } from "@/lib/db";
import { BotAI, BotDifficulty } from "@/lib/poker/bot";
import { useCoaching } from "@/lib/useCoaching";
import { evaluateHand } from "@/lib/poker/evaluator";
import { TavernLayout } from "./TavernLayout";
import { PokerTable } from "./PokerTable";
import { PlayerSeat } from "./PlayerSeat";
import { CommunityCards } from "./CommunityCards";
import { ActionBar } from "./ActionBar";
import { AdviceCard } from "./AdviceCard";
import { BankrollHeader } from "./BankrollHeader";
import { RightDrawerPanel } from "./RightDrawerPanel";
import { SettingsDialog } from "./SettingsDialog";
import { DebugPanel } from "./DebugPanel";
import { useLiveQuery } from "dexie-react-hooks";

const OPPONENT_NAMES: Record<string, string> = {
  easy: "The Drunk Bard",
  medium: "The Cunning Rogue",
  expert: "The Iron Knight",
};

const OPPONENT_AVATARS: Record<string, string> = {
  easy: "\u{1F3B6}",
  medium: "\u{1F5E1}",
  expert: "\u{1F6E1}",
};

function getSeatPosition(index: number, totalPlayers: number): any {
  if (totalPlayers === 2) {
    return index === 0 ? "bottom" : "top";
  }

  const positions: Record<number, string[]> = {
    3: ["bottom", "topLeft", "topRight"],
    4: ["bottom", "left", "top", "right"],
    5: ["bottom", "left", "topLeft", "topRight", "right"],
    6: ["bottom", "bottomLeft", "topLeft", "top", "topRight", "bottomRight"],
  };

  return (positions[totalPlayers] || positions[2])[index] || "bottom";
}

export const GameController: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  
  const difficulty = settings?.difficulty || "medium";
  const playerCount = settings?.playerCount || 2;

  const opponentName = OPPONENT_NAMES[difficulty === 'mixed' ? 'medium' : difficulty] || "The Cunning Rogue";
  const opponentAvatar = OPPONENT_AVATARS[difficulty === 'mixed' ? 'medium' : difficulty] || "\u{1F5E1}";

  const pokerEngine = useMemo(() => new PokerGame(), []);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const { feedback, setFeedback, evaluateAction } = useCoaching();

  const currentHandAccuracies = useRef<number[]>([]);

  // Live stats from Dexie
  const hands = useLiveQuery(() => db.hands.toArray());
  const totalHands = hands?.length || 0;
  const totalProfit = hands?.reduce((sum, h) => sum + h.profit, 0) || 0;
  const handsWon = hands?.filter((h) => h.won).length || 0;
  const avgAccuracy = totalHands > 0
    ? Math.round((hands?.reduce((sum, h) => sum + h.accuracyScore, 0) || 0) / totalHands)
    : 0;

  const startHand = useCallback((currentSettings: any) => {
    const players = [{ id: "p1", name: "You" }];
    const count = currentSettings?.playerCount || 2;
    const diff = currentSettings?.difficulty || "medium";

    for (let i = 1; i < count; i++) {
      const botDiff = diff === 'mixed' ? (['easy', 'medium', 'expert'][i % 3]) : diff;
      players.push({
        id: `bot-${i}`,
        name: `${OPPONENT_NAMES[botDiff as BotDifficulty]} #${i}`
      });
    }

    const initialState = pokerEngine.initializeGame(players);
    setGameState(initialState);
    currentHandAccuracies.current = [];
  }, [pokerEngine]);

  useEffect(() => {
    async function init() {
      await ensureSettings();
      const s = await db.settings.toCollection().first();
      startHand(s);
    }
    init();
  }, [pokerEngine, startHand]);

  useEffect(() => {
    const handleLeave = async () => {
      if (gameState && gameState.stage !== "END" && gameState.stage !== "SHOWDOWN") {
        const player = gameState.players.find((p) => p.id === "p1")!;
        await db.hands.add({
          timestamp: Date.now(),
          finalState: gameState,
          won: false,
          profit: player.stack - 1000,
          accuracyScore: 0,
          reason: "left game",
        });
      }
      router.push("/");
    };

    window.addEventListener('leave-game', handleLeave);
    return () => window.removeEventListener('leave-game', handleLeave);
  }, [gameState, router]);

  const processAction = useCallback(
    async (action: Action) => {
      setGameState((current) => {
        if (!current) return null;
        try {
          let newState = handleAction(current, action);

          if (newState.stage === "SHOWDOWN" && current.stage !== "SHOWDOWN") {
            const player = newState.players.find((p) => p.id === "p1")!;
            const avgAcc =
              currentHandAccuracies.current.length > 0
                ? currentHandAccuracies.current.reduce((a, b) => a + b, 0) /
                  currentHandAccuracies.current.length
                : 100;

            db.hands.add({
              timestamp: Date.now(),
              finalState: newState,
              won: newState.winnerId === "p1",
              profit: player.stack - 1000,
              accuracyScore: avgAcc,
            });
            currentHandAccuracies.current = [];
          }
          
          return newState;
        } catch (e) {
          console.error("Action error:", e);
          return current;
        }
      });
    },
    [pokerEngine]
  );

  useEffect(() => {
    if (gameState?.activePlayerIndex === -1 && gameState?.stage !== "SHOWDOWN" && gameState?.stage !== "END") {
      const timer = setTimeout(() => {
        setGameState((current) => {
          if (!current || current.activePlayerIndex !== -1 || current.stage === "SHOWDOWN" || current.stage === "END") return current;
          
          let nextState;
          if (current.stage === "PREFLOP") {
            nextState = pokerEngine.transitionToFlop(current);
          } else if (current.stage === "FLOP") {
            nextState = pokerEngine.transitionToTurn(current);
          } else if (current.stage === "TURN") {
            nextState = pokerEngine.transitionToRiver(current);
          } else {
            nextState = { ...current, stage: "SHOWDOWN" as const };
          }
          return nextState;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, pokerEngine]);

  const onPlayerAction = async (type: ActionType, amount?: number) => {
    if (!gameState || isBotThinking) return;

    const action: Action = {
      playerId: "p1",
      type,
      amount: type === "RAISE" ? amount : undefined,
    };

    const s = await db.settings.toCollection().first();
    const recommendation = BotAI.getAction(gameState, "expert");
    const isCorrect = action.type === recommendation.type;
    currentHandAccuracies.current.push(isCorrect ? 100 : 0);

    if (s?.feedbackTiming === "immediate") {
      evaluateAction(gameState, action);
    }

    processAction(action);
  };

  useEffect(() => {
    if (gameState && gameState.activePlayerIndex !== -1 && gameState.stage !== "SHOWDOWN") {
      const activePlayer = gameState.players[gameState.activePlayerIndex];
      const isBot = activePlayer.id.startsWith("bot");
      
      // Handle Bot Turn
      if (isBot && !isBotThinking) {
        setIsBotThinking(true);
        const timer = setTimeout(async () => {
          try {
            const s = await db.settings.toCollection().first();
            const botAction = BotAI.getAction(gameState, s?.difficulty || "medium");
            processAction(botAction);
          } catch (e) {
            console.error("Bot action error:", e);
          } finally {
            setIsBotThinking(false);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
      
      // Handle Hero All-in (Auto-check)
      if (!isBot && activePlayer.stack === 0 && !isBotThinking) {
        const timer = setTimeout(() => {
          processAction({ playerId: activePlayer.id, type: "CHECK" });
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, isBotThinking, processAction]);

  if (!gameState)
    return (
      <div className="min-h-screen bg-tavern-dark flex items-center justify-center font-pixel text-tavern-gold">
        <span className="animate-pulse text-xs uppercase tracking-widest">Loading...</span>
      </div>
    );

  const opponent = gameState.players.find((p) => p.id !== "p1")!;
  const player = gameState.players.find((p) => p.id === "p1")!;
  const isPlayerTurn =
    gameState.activePlayerIndex !== -1 &&
    gameState.players[gameState.activePlayerIndex].id === "p1" &&
    !isBotThinking;

  const canCheck = player.currentBet === opponent.currentBet;
  const callAmount = opponent.currentBet - player.currentBet;
  const minRaise = Math.max(opponent.currentBet * 2, 40);
  const maxRaise = player.stack + player.currentBet;

  // Hand strength label
  const handResult = player.holeCards.length > 0 ? evaluateHand(player.holeCards, gameState.communityCards) : null;

  return (
    <TavernLayout mode="table">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-tavern-dark/80 border-b border-tavern-wood/30 z-20">
        <BankrollHeader bankroll={player.stack} tier={difficulty} />
        <SettingsDialog />
      </div>

      <DebugPanel gameState={gameState} />

      {/* Advice card */}
      {feedback && (
        <AdviceCard
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Right drawer */}
      <RightDrawerPanel
        gameState={gameState}
        opponentId="bot"
        handsPlayed={totalHands}
        winRate={totalHands > 0 ? Math.round((handsWon / totalHands) * 100) : 0}
        profit={totalProfit}
        accuracy={avgAccuracy}
      />

      {/* Main table area */}
      <div className="flex-1 flex items-center justify-center w-full px-6 py-6 md:px-12 md:py-8">
        <PokerTable pot={gameState.pot}>
          <CommunityCards cards={gameState.communityCards} />

          {gameState.players.map((p, idx) => {
            const position = getSeatPosition(idx, gameState.players.length);
            return (
              <PlayerSeat
                key={p.id}
                name={p.id === "p1" ? "You" : p.name}
                chips={p.stack}
                isActive={gameState.activePlayerIndex === idx}
                position={position}
                isDealer={gameState.dealerIndex === idx}
                holeCards={p.holeCards}
                isCurrentPlayer={p.id === "p1" || gameState.stage === "SHOWDOWN"}
                currentBet={p.currentBet}
                isFolded={p.isFolded}
                avatar={p.id === "p1" ? undefined : opponentAvatar}
                lastAction={gameState.lastAction?.playerId === p.id ? gameState.lastAction.type : undefined}
              />
            );
          })}
        </PokerTable>
      </div>

      {/* Bottom action bar */}
      <ActionBar
        onAction={onPlayerAction}
        canCheck={canCheck}
        canCall={callAmount > 0}
        canRaise={player.stack > 0}
        callAmount={callAmount}
        minRaise={minRaise}
        maxRaise={maxRaise}
        pot={gameState.pot}
        handStrengthLabel={handResult?.name}
        disabled={!isPlayerTurn}
        isBotThinking={isBotThinking && gameState.stage !== "SHOWDOWN"}
        isShowdown={gameState.stage === "SHOWDOWN"}
        showdownWon={gameState.winnerId === "p1"}
        onNextHand={() => {
          db.settings.toCollection().first().then(s => startHand(s));
        }}
      />
    </TavernLayout>
  );
};
