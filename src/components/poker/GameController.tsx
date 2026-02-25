"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PokerGame } from "@/lib/poker/state-machine";
import { handleAction } from "@/lib/poker/betting";
import { GameState, ActionType, Action } from "@/lib/poker/types";
import { db, ensureSettings } from "@/lib/db";
import { BotAI, BotDifficulty } from "@/lib/poker/bot";
import { useCoaching } from "@/lib/useCoaching";
import { 
  TavernLayout, 
  PokerTable, 
  PlayerSeat, 
  CommunityCards, 
  ActionButtons, 
  BetSlider,
  SettingsDialog,
  HandStrength,
  InsightPanel,
  FeedbackOverlay,
  StatsDashboard,
  HandHistoryViewer
} from "./";

export const GameController: React.FC = () => {
  const pokerEngine = useMemo(() => new PokerGame(), []);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const { feedback, setFeedback, evaluateAction } = useCoaching();
  
  const currentHandAccuracies = useRef<number[]>([]);

  useEffect(() => {
    async function init() {
      await ensureSettings();
      const initialState = pokerEngine.initializeGame("p1", "You", "bot", "Drunk Bard");
      setGameState(initialState);
    }
    init();
  }, [pokerEngine]);

  const processAction = useCallback(async (action: Action) => {
    setGameState((current) => {
      if (!current) return null;
      try {
        let newState = handleAction(current, action);

        if (newState.activePlayerIndex === -1) {
          if (newState.stage === "PREFLOP") {
            newState = pokerEngine.transitionToFlop(newState);
          } else {
            newState.stage = "SHOWDOWN";
            const player = newState.players.find(p => p.id === "p1")!;
            const avgAccuracy = currentHandAccuracies.current.length > 0 
              ? currentHandAccuracies.current.reduce((a, b) => a + b, 0) / currentHandAccuracies.current.length 
              : 100;

            db.hands.add({
              timestamp: Date.now(),
              finalState: newState,
              won: newState.winnerId === "p1",
              profit: player.stack - 1000,
              accuracyScore: avgAccuracy
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
  }, [pokerEngine]);

  const onPlayerAction = async (type: ActionType, amount?: number) => {
    if (!gameState || isBotThinking) return;
    
    const action: Action = {
      playerId: "p1",
      type,
      amount: type === "RAISE" ? (amount || betAmount) : undefined,
    };

    const settings = await db.settings.toCollection().first();
    const recommendation = BotAI.getAction(gameState, 'expert');
    const isCorrect = action.type === recommendation.type;
    currentHandAccuracies.current.push(isCorrect ? 100 : 0);

    if (settings?.feedbackTiming === 'immediate') {
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
          const settings = await db.settings.toCollection().first();
          const difficulty = (settings?.difficulty || "medium") as BotDifficulty;
          const botAction = BotAI.getAction(gameState, difficulty);
          processAction(botAction);
          setIsBotThinking(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, isBotThinking, processAction]);

  if (!gameState) return <div className="min-h-screen bg-tavern-dark flex items-center justify-center font-pixel text-tavern-gold">Loading...</div>;

  const opponent = gameState.players.find(p => p.id !== "p1")!;
  const player = gameState.players.find(p => p.id === "p1")!;
  const isPlayerTurn = gameState.activePlayerIndex !== -1 && gameState.players[gameState.activePlayerIndex].id === "p1" && !isBotThinking;

  const canCheck = player.currentBet === opponent.currentBet;
  const callAmount = opponent.currentBet - player.currentBet;
  
  const minRaise = Math.max(opponent.currentBet * 2, 40);
  const maxRaise = player.stack + player.currentBet;

  return (
    <TavernLayout>
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <HandHistoryViewer />
        <StatsDashboard />
        <SettingsDialog />
      </div>

      {feedback && (
        <FeedbackOverlay 
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="flex flex-col items-center w-full h-full justify-between pb-8 pt-12">
        <div className="flex flex-col items-center gap-2">
           <InsightPanel state={gameState} opponentId="bot" />
        </div>

        <PokerTable className="mt-8">
          <CommunityCards cards={gameState.communityCards} />
          
          <PlayerSeat
            name={opponent.name}
            chips={opponent.stack}
            isActive={gameState.activePlayerIndex !== -1 && gameState.players[gameState.activePlayerIndex].id === opponent.id}
            position="top"
            holeCards={opponent.holeCards}
            isCurrentPlayer={gameState.stage === "SHOWDOWN"}
          />
          
          <PlayerSeat
            name={player.name}
            chips={player.stack}
            isActive={isPlayerTurn}
            position="bottom"
            isDealer={gameState.dealerIndex === 0}
            holeCards={player.holeCards}
            isCurrentPlayer={true}
          />
        </PokerTable>

        <div className="w-full max-w-2xl flex flex-col items-center gap-4 bg-black/60 p-4 pixel-border">
          <div className="flex w-full justify-between items-center px-4">
            <div className="text-white text-[10px] uppercase">Pot: {gameState.pot}</div>
            <HandStrength holeCards={player.holeCards} communityCards={gameState.communityCards} />
          </div>
          
          {isPlayerTurn && (
            <>
              <BetSlider
                value={betAmount < minRaise ? minRaise : betAmount}
                min={minRaise}
                max={maxRaise}
                onChange={setBetAmount}
              />
              <ActionButtons
                onAction={onPlayerAction}
                canCheck={canCheck}
                canCall={callAmount > 0}
                canRaise={player.stack > 0}
                callAmount={callAmount}
                minRaise={minRaise}
                maxRaise={maxRaise}
                disabled={!isPlayerTurn}
              />
            </>
          )}
          {isBotThinking && gameState.stage !== "SHOWDOWN" && (
            <div className="text-xl animate-pulse text-tavern-gold uppercase">Drunk Bard is thinking...</div>
          )}
          {gameState.stage === "SHOWDOWN" && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-bold text-white uppercase tracking-widest animate-bounce">
                {gameState.winnerId === "p1" ? "Victory!" : "Defeat!"}
              </div>
              <button 
                onClick={() => {
                  setGameState(pokerEngine.initializeGame("p1", "You", "bot", "Drunk Bard"));
                  currentHandAccuracies.current = [];
                }}
                className="bg-tavern-gold text-tavern-dark px-6 py-3 pixel-border uppercase hover:bg-white text-xs font-bold"
              >
                Next Hand
              </button>
            </div>
          )}
        </div>
      </div>
    </TavernLayout>
  );
};
