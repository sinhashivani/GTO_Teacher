"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PokerGame } from "@/lib/poker/state-machine";
import { handleAction } from "@/lib/poker/betting";
import { GameState, ActionType, Action } from "@/lib/poker/types";
import { db, ensureSettings } from "@/lib/db";
import { BotAI, BotDifficulty } from "@/lib/poker/bot";
import { useCoaching } from "@/lib/useCoaching";
import { evaluateHand, determineWinners } from "@/lib/poker/evaluator";
import { settlePot } from "@/lib/poker/settlement";
import { getBankroll, updateBankroll, saveAllBankrolls } from "@/lib/poker/bankroll";
import { TavernLayout } from "./TavernLayout";
import { PokerTable } from "./PokerTable";
import { PlayerSeat } from "./PlayerSeat";
import { CommunityCards } from "./CommunityCards";
import { ActionBar } from "./ActionBar";
import { AdviceCard } from "./AdviceCard";
import { ShowdownBanner } from "./ShowdownBanner";
import { HandRankingModal } from "./HandRankingModal";
import { RoundReportModal } from "./RoundReportModal";
import { GlossaryDialog } from "./GlossaryDialog";
import { BankrollHeader } from "./BankrollHeader";
import { RightDrawerPanel } from "./RightDrawerPanel";
import { SettingsDialog } from "./SettingsDialog";
import { DebugPanel } from "./DebugPanel";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
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

function getPositionLabel(index: number, dealerIndex: number, totalPlayers: number): string {
  const diff = (index - dealerIndex + totalPlayers) % totalPlayers;
  
  if (totalPlayers === 2) {
    return diff === 0 ? "BTN" : "BB";
  }
  
  if (diff === 0) return "BTN";
  if (diff === 1) return "SB";
  if (diff === 2) return "BB";
  
  if (totalPlayers === 4) {
    if (diff === 3) return "CO";
  }
  if (totalPlayers === 5) {
    if (diff === 3) return "UTG";
    if (diff === 4) return "CO";
  }
  if (totalPlayers === 6) {
    if (diff === 3) return "UTG";
    if (diff === 4) return "MP";
    if (diff === 5) return "CO";
  }
  
  return "";
}

export const GameController: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [activeSettings, setActiveSettings] = useState<any>(null);
  
  const pokerEngine = useMemo(() => new PokerGame(), []);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const publicState = useMemo(() => {
    if (!gameState) return null;
    return PokerGame.getPublicState(gameState, "p1");
  }, [gameState]);

  const [isBotThinking, setIsBotThinking] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [showReport, setShowReport] = useState(false);
  const [lastHandState, setLastHandState] = useState<{ gameState: GameState, evaluations: Record<string, any> } | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const { feedback, setFeedback, evaluateAction } = useCoaching();

  // Settings buffering: Difficulty and Player Count are locked when hand starts
  const currentDifficulty = activeSettings?.difficulty || settings?.difficulty || "medium";
  const currentPlayerCount = activeSettings?.playerCount || settings?.playerCount || 2;
  const gameSpeed = settings?.gameSpeed || "normal";

  const opponentAvatar = OPPONENT_AVATARS[currentDifficulty === 'mixed' ? 'medium' : currentDifficulty] || "\u{1F5E1}";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        if (lastHandState) {
          setShowReport(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastHandState]);

  const currentHandAccuracies = useRef<number[]>([]);
  const currentHandEvDeltas = useRef<number[]>([]);
  const currentHandLeaks = useRef<string[]>([]);
  
  // Logical keys for turn and transition to prevent redundant triggers or stalls
  const turnKey = useMemo(() => {
    if (!gameState || gameState.activePlayerIndex === -1 || gameState.stage === "SHOWDOWN") return null;
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    const isBot = activePlayer.id.startsWith("bot");
    
    if (!isBot) return null; // Player turn, handled by UI

    return `${gameState.stage}-${gameState.activePlayerIndex}-${activePlayer.id}`;
  }, [gameState]);

  const transitionKey = useMemo(() => {
    if (!gameState || gameState.activePlayerIndex !== -1 || gameState.stage === "SHOWDOWN" || gameState.stage === "END") return null;
    return `${gameState.stage}-transition`;
  }, [gameState]);

  // Live stats from Dexie
  const hands = useLiveQuery(() => db.hands.toArray());
  const totalHands = hands?.length || 0;
  const totalProfit = hands?.reduce((sum, h) => sum + h.profit, 0) || 0;
  const handsWon = hands?.filter((h) => h.won).length || 0;
  const avgAccuracy = totalHands > 0
    ? Math.round((hands?.reduce((sum, h) => sum + h.accuracyScore, 0) || 0) / totalHands)
    : 0;

  const startHand = useCallback((currentSettings: any, dealerIndex: number = 0) => {
    setActiveSettings(currentSettings);
    const players = [{ id: "p1", name: "You" }];
    const count = currentSettings?.playerCount || 2;
    const diff = currentSettings?.difficulty || "medium";

    for (let i = 1; i < count; i++) {
      const botDiff = diff === 'mixed' ? (['easy', 'medium', 'expert'][i % 3]) : diff;
      players.push({
        id: `bot-${i}`,
        name: `${OPPONENT_NAMES[botDiff as BotDifficulty]} #${i}`,
        difficulty: botDiff
      });
    }

    const initialState = pokerEngine.initializeGame(
      players, 
      currentSettings?.creditMode, 
      currentSettings?.creditLimit,
      dealerIndex
    );
    
    // Load persistent bankrolls
    initialState.players.forEach(p => {
      p.stack = getBankroll(p.id, currentSettings?.startingStack || 1000);
    });
    
    setGameState(initialState);
    setEvaluations({});
    currentHandAccuracies.current = [];
    currentHandEvDeltas.current = [];
    currentHandLeaks.current = [];
  }, [pokerEngine]);

  useEffect(() => {
    async function init() {
      await ensureSettings();
      const s = await db.settings.toCollection().first();
      // Start first hand with dealer at index 0 (Hero) or random
      startHand(s, 0);
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
          profit: 0, // Simplified profit tracking
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
      let nextState: GameState | null = null;
      
      setGameState((current) => {
        if (!current) return null;
        try {
          nextState = handleAction(
            current, 
            action, 
            activeSettings?.creditMode, 
            activeSettings?.creditLimit
          );
          return nextState;
        } catch (e) {
          console.error("Action error:", e);
          return current;
        }
      });

      // Side-effect after state update (not perfectly synced but better)
      // Actually, we can't easily get nextState out of setGameState functional update synchronously.
      // But we can calculate it twice or use a ref.
      // For now, let's just make the functional update pure and move saveAllBankrolls to an effect.
    },
    [pokerEngine, activeSettings]
  );

  // Auto-persist state changes
  useEffect(() => {
    if (gameState?.players) {
      saveAllBankrolls(gameState.players);
    }
  }, [gameState?.players]);

  // Reactive settlement and hand persistence
  useEffect(() => {
    if (gameState?.stage === "SHOWDOWN" && !gameState.winners) {
      const runSettlement = async () => {
        const settlement = settlePot(gameState.players, gameState.communityCards, gameState.pot, gameState.dealerIndex);
        
        // Calculate evaluations for report and UI
        const { evaluationsByPlayerId } = determineWinners(gameState.players, gameState.communityCards);
        
        // Hero profit for stats
        const heroInHand = gameState.players.find(p => p.id === "p1")!;
        const profit = (settlement.payouts["p1"] || 0) - heroInHand.totalBet;

        const avgEvDelta = currentHandEvDeltas.current.length > 0
          ? currentHandEvDeltas.current.reduce((a, b) => a + b, 0) / currentHandEvDeltas.current.length
          : 0;

        // Update state with results
        setGameState(current => {
          if (!current || current.winners) return current;
          const updatedPlayers = current.players.map(p => ({
            ...p,
            stack: p.stack + (settlement.payouts[p.id] || 0)
          }));
          
          return {
            ...current,
            players: updatedPlayers,
            winners: settlement.winners,
            winnerId: settlement.winners[0]
          };
        });

        // Add to hand history
        await db.hands.add({
          timestamp: Date.now(),
          finalState: {
            ...gameState,
            winners: settlement.winners,
            winnerId: settlement.winners[0]
          },
          won: settlement.winners.includes("p1"),
          profit: profit,
          accuracyScore: currentHandAccuracies.current.length > 0
            ? currentHandAccuracies.current.reduce((a, b) => a + b, 0) / currentHandAccuracies.current.length
            : 100,
          evDelta: avgEvDelta,
          leaks: [...currentHandLeaks.current]
        });

        setEvaluations(evaluationsByPlayerId);
        setLastHandState({ 
          gameState: { ...gameState, winners: settlement.winners, winnerId: settlement.winners[0] }, 
          evaluations: evaluationsByPlayerId 
        });
        currentHandAccuracies.current = [];
        currentHandEvDeltas.current = [];
        currentHandLeaks.current = [];

        // Bot Quit Check
        const finalPlayers = gameState.players.map(p => ({
          id: p.id,
          stack: p.stack + (settlement.payouts[p.id] || 0)
        }));

        const quittingBot = finalPlayers.find(p => {
          if (!p.id.startsWith('bot')) return false;
          const player = gameState.players.find(bp => bp.id === p.id)!;
          const threshold = player.difficulty === 'easy' ? -500 : (player.difficulty === 'medium' ? -1000 : -2000);
          return p.stack <= threshold;
        });

        if (quittingBot) {
          setTimeout(() => {
            alert(`${quittingBot.id} has run out of funds and left the table.`);
            router.push('/');
          }, 2000);
        }
      };

      runSettlement();
    }
  }, [gameState, router]);

  useEffect(() => {
    if (!transitionKey || !gameState) return;

    const delay = gameSpeed === "fast" ? 800 : 2000;
    const timer = setTimeout(() => {
      setGameState((current) => {
        if (!current || current.activePlayerIndex !== -1 || current.stage === "SHOWDOWN" || current.stage === "END") return current;
        
        let nextState;
        if (current.stage === "PREFLOP") {
          nextState = pokerEngine.transitionToFlop(current, activeSettings?.creditMode, activeSettings?.creditLimit);
        } else if (current.stage === "FLOP") {
          nextState = pokerEngine.transitionToTurn(current, activeSettings?.creditMode, activeSettings?.creditLimit);
        } else if (current.stage === "TURN") {
          nextState = pokerEngine.transitionToRiver(current, activeSettings?.creditMode, activeSettings?.creditLimit);
        } else {
          nextState = { ...current, stage: "SHOWDOWN" as const };
        }
        return nextState;
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [transitionKey, pokerEngine, gameSpeed, activeSettings]);

  const onPlayerAction = async (type: ActionType, amount?: number) => {
    if (!gameState || isBotThinking) return;

    const s = await db.settings.toCollection().first();
    const expertScores = BotAI.getExpertScores(gameState);
    const heroScore = expertScores[type] || 0;
    const bestScore = Math.max(...Object.values(expertScores));
    const evDelta = bestScore - heroScore;
    
    currentHandAccuracies.current.push(heroScore === bestScore ? 100 : 0);
    currentHandEvDeltas.current.push(evDelta);

    if (evDelta > 0.5) {
      let leak = "";
      if (type === 'FOLD') leak = `Over-folding on ${gameState.stage}`;
      else if (type === 'RAISE') leak = `Over-aggressive on ${gameState.stage}`;
      else if (type === 'CALL') leak = `Passive play on ${gameState.stage}`;
      else if (type === 'CHECK') leak = `Missing value on ${gameState.stage}`;
      
      if (leak && !currentHandLeaks.current.includes(leak)) {
        currentHandLeaks.current.push(leak);
      }
    }

    const recommendation = BotAI.getAction(gameState, "expert");
    const isCorrect = type === recommendation.type;

    const action: Action = {
      playerId: "p1",
      type,
      amount: type === "RAISE" ? amount : undefined,
      deviation: isCorrect ? undefined : {
        recommended: recommendation.type,
        rationale: "Expert GTO baseline suggests a different line here."
      },
      // Store full coaching context for the report
      coaching: {
        recommended: recommendation.type,
        why: isCorrect ? "Correct! This is the standard GTO play." : "This is a deviation from the recommended baseline.",
        confidence: 'heuristic',
        alternatives: [] // Ideally BotAI provides these
      },
      scores: expertScores
    };

    if (s?.feedbackTiming === "immediate") {
      evaluateAction(gameState, action);
    }

    // Attach full coaching context for the report
    action.coaching = {
      recommended: recommendation.type,
      why: isCorrect 
        ? "Your action aligns with GTO principles for this street and position." 
        : `GTO baseline suggests ${recommendation.type}. This deviation could lead to long-term losses against balanced opponents.`,
      whatChanges: "Against tighter opponents, you could increase raise sizes. Against loose players, call more often.",
      confidence: 'heuristic',
      alternatives: [
        { type: isCorrect ? 'CHECK' : 'CALL', reason: 'A viable low-variance alternative in this specific texture.' }
      ]
    };

    processAction(action);
  };

  useEffect(() => {
    if (!turnKey || !gameState) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    const isBot = activePlayer.id.startsWith("bot");
    
    if (isBot) {
      setIsBotThinking(true);
      const delay = gameSpeed === "fast" ? 500 : 1500;
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
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [turnKey, processAction, gameSpeed]);

  if (!publicState)
    return (
      <div className="min-h-screen bg-tavern-dark flex items-center justify-center font-pixel text-tavern-gold">
        <span className="animate-pulse text-xs uppercase tracking-widest">Loading...</span>
      </div>
    );

  const player = publicState.players.find((p) => p.id === "p1")!;
  const isPlayerTurn =
    publicState.activePlayerIndex !== -1 &&
    publicState.players[publicState.activePlayerIndex].id === "p1" &&
    !isBotThinking;

  const canCheck = player.currentBet === Math.max(...publicState.players.map(p => p.currentBet));
  const callAmount = Math.max(...publicState.players.map(p => p.currentBet)) - player.currentBet;
  const minRaise = Math.max(Math.max(...publicState.players.map(p => p.currentBet)) * 2, 40);
  const maxRaise = (activeSettings?.creditMode ? (player.stack - activeSettings.creditLimit) : player.stack) + player.currentBet;

  // Hand strength label
  const handResult = player.holeCards.length > 0 ? evaluateHand(player.holeCards, publicState.communityCards) : null;

  return (
    <TavernLayout mode="table">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-tavern-dark/80 border-b border-tavern-wood/30 z-20">
        <div className="flex items-center gap-4">
          <BankrollHeader bankroll={player.stack} tier={currentDifficulty} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsGlossaryOpen(true)}
            className="bg-tavern-wood/20 border-tavern-wood text-tavern-gold text-[8px] uppercase h-7 hover:bg-tavern-wood/40"
          >
            <BookOpen className="w-3 h-3 mr-1" />
            Glossary
          </Button>
        </div>
        <SettingsDialog />
      </div>

      <DebugPanel gameState={gameState!} evaluations={evaluations} />
      <HandRankingModal />

      {hands && (
        <RoundReportModal 
          isOpen={showReport} 
          onClose={() => setShowReport(false)} 
          allHands={hands}
        />
      )}

      <GlossaryDialog isOpen={isGlossaryOpen} onOpenChange={setIsGlossaryOpen} />

      <ShowdownBanner 
        isVisible={publicState.stage === "SHOWDOWN"} 
        won={publicState.winners?.includes("p1") || false}
        handName={evaluations["p1"]?.description || ""}
      />

      {/* Advice card */}
      {feedback && (
        <AdviceCard
          feedback={feedback}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Right drawer */}
      <RightDrawerPanel
        gameState={publicState}
        opponentId="bot"
        handsPlayed={totalHands}
        winRate={totalHands > 0 ? Math.round((handsWon / totalHands) * 100) : 0}
        profit={totalProfit}
        accuracy={avgAccuracy}
        evaluations={evaluations}
      />

      {/* Main table area */}
      <div className="flex-1 flex items-center justify-center w-full px-6 py-6 md:px-12 md:py-8">
        <PokerTable pot={publicState.pot}>
          <CommunityCards 
            cards={publicState.communityCards} 
            highlightedCards={Object.values(evaluations).flatMap(e => e.best5)}
          />

          {publicState.players.map((p, idx) => {
            const position = getSeatPosition(idx, publicState.players.length);
            const evaluation = evaluations[p.id];
            const posLabel = getPositionLabel(idx, publicState.dealerIndex, publicState.players.length);
            
            return (
              <PlayerSeat
                key={p.id}
                name={p.id === "p1" ? "You" : p.name}
                chips={p.stack}
                isActive={publicState.activePlayerIndex === idx}
                position={position}
                isDealer={publicState.dealerIndex === idx}
                positionLabel={posLabel}
                showPositionLabels={settings?.showPositionLabels}
                holeCards={p.holeCards}
                isCurrentPlayer={p.id === "p1" || publicState.stage === "SHOWDOWN"}
                currentBet={p.currentBet}
                isFolded={p.isFolded}
                avatar={p.id === "p1" ? undefined : opponentAvatar}
                lastAction={publicState.lastAction?.playerId === p.id ? publicState.lastAction.type : undefined}
                highlightedCards={evaluation?.best5}
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
        canRaise={player.stack > (activeSettings?.creditMode ? activeSettings?.creditLimit : 0)}
        callAmount={callAmount}
        minRaise={minRaise}
        maxRaise={maxRaise}
        pot={publicState.pot}
        handStrengthLabel={handResult?.description}
        disabled={!isPlayerTurn}
        isBotThinking={isBotThinking && publicState.stage !== "SHOWDOWN"}
        isShowdown={publicState.stage === "SHOWDOWN"}
        showdownWon={publicState.winners?.includes("p1")}
        onNextHand={() => {
          db.settings.toCollection().first().then(s => {
            // Force bankroll reload by passing updated settings
            if (s) {
              const nextDealer = gameState ? (gameState.dealerIndex + 1) % currentPlayerCount : 0;
              startHand(s, nextDealer);
            }
          });
        }}
        onShowReport={() => setShowReport(true)}
      />
    </TavernLayout>
  );
};
