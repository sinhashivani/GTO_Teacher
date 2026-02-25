"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
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

export const GameController: React.FC = () => {
  const searchParams = useSearchParams();
  const difficultyParam = searchParams.get("difficulty") || "medium";
  const difficulty = (["easy", "medium", "expert"].includes(difficultyParam) ? difficultyParam : "medium") as BotDifficulty;

  const opponentName = OPPONENT_NAMES[difficulty] || "The Cunning Rogue";
  const opponentAvatar = OPPONENT_AVATARS[difficulty] || "\u{1F5E1}";

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

  useEffect(() => {
    async function init() {
      await ensureSettings();
      const initialState = pokerEngine.initializeGame("p1", "You", "bot", opponentName);
      setGameState(initialState);
    }
    init();
  }, [pokerEngine, opponentName]);

  const processAction = useCallback(
    async (action: Action) => {
      setGameState((current) => {
        if (!current) return null;
        try {
          let newState = handleAction(current, action);

          if (newState.activePlayerIndex === -1) {
            if (newState.stage === "PREFLOP") {
              newState = pokerEngine.transitionToFlop(newState);
            } else {
              newState.stage = "SHOWDOWN";
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

  const onPlayerAction = async (type: ActionType, amount?: number) => {
    if (!gameState || isBotThinking) return;

    const action: Action = {
      playerId: "p1",
      type,
      amount: type === "RAISE" ? amount : undefined,
    };

    const settings = await db.settings.toCollection().first();
    const recommendation = BotAI.getAction(gameState, "expert");
    const isCorrect = action.type === recommendation.type;
    currentHandAccuracies.current.push(isCorrect ? 100 : 0);

    if (settings?.feedbackTiming === "immediate") {
      evaluateAction(gameState, action);
    }

    processAction(action);
  };

  useEffect(() => {
    if (gameState && gameState.activePlayerIndex !== -1) {
      const activePlayer = gameState.players[gameState.activePlayerIndex];
      if (activePlayer.id === "bot" && !isBotThinking && gameState.stage !== "SHOWDOWN") {
        setIsBotThinking(true);
        const timer = setTimeout(async () => {
          const botAction = BotAI.getAction(gameState, difficulty);
          processAction(botAction);
          setIsBotThinking(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, isBotThinking, processAction, difficulty]);

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

          <PlayerSeat
            name={opponentName}
            chips={opponent.stack}
            isActive={
              gameState.activePlayerIndex !== -1 &&
              gameState.players[gameState.activePlayerIndex].id === opponent.id
            }
            position="top"
            holeCards={opponent.holeCards}
            isCurrentPlayer={gameState.stage === "SHOWDOWN"}
            currentBet={opponent.currentBet}
            isFolded={opponent.isFolded}
            avatar={opponentAvatar}
          />

          <PlayerSeat
            name={player.name}
            chips={player.stack}
            isActive={isPlayerTurn}
            position="bottom"
            isDealer={gameState.dealerIndex === 0}
            holeCards={player.holeCards}
            isCurrentPlayer={true}
            currentBet={player.currentBet}
            isFolded={player.isFolded}
          />
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
          setGameState(pokerEngine.initializeGame("p1", "You", "bot", opponentName));
          currentHandAccuracies.current = [];
        }}
      />
    </TavernLayout>
  );
};
