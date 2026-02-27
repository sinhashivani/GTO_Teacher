import { GameState, Action, ActionType, Player } from './types';
import { evaluateHand } from './evaluator';

export type BotDifficulty = 'easy' | 'medium' | 'expert' | 'mixed';

export class BotAI {
  static getCreditLimit(difficulty: BotDifficulty): number {
    switch (difficulty) {
      case 'easy': return -500;
      case 'medium': return -1000;
      case 'expert': return -2000;
      default: return -1000;
    }
  }

  static getAction(state: GameState, difficulty: BotDifficulty): Action {
    const bot = state.players[state.activePlayerIndex];
    
    // Evaluate hand strength
    const result = evaluateHand(bot.holeCards, state.communityCards);
    const handScore = result.classRank * 100;
    const currentMaxBet = Math.max(...state.players.map(p => p.currentBet));
    const callAmount = currentMaxBet - bot.currentBet;
    
    let effectiveDifficulty = difficulty;
    if (difficulty === 'mixed') {
      // Deterministic difficulty based on seat index for "Mixed" mode
      const levels: BotDifficulty[] = ['easy', 'medium', 'expert'];
      effectiveDifficulty = levels[state.activePlayerIndex % 3] as BotDifficulty;
    }

    // Credit Limit Logic
    const creditLimit = this.getCreditLimit(effectiveDifficulty);
    const availableToCall = bot.stack - creditLimit;

    if (callAmount > availableToCall && availableToCall > 0) {
      // Bot is near its credit limit. If hand is weak, just fold.
      // If hand is strong, go all-in (CALL will be capped by handleAction).
      if (handScore < 200) {
        return { playerId: bot.id, type: 'FOLD' };
      }
    } else if (availableToCall <= 0 && callAmount > 0) {
      // Already at or past limit and facing a bet
      return { playerId: bot.id, type: 'FOLD' };
    }

    switch (effectiveDifficulty) {
      case 'easy':
        return this.easyLogic(bot, state, callAmount, handScore);
      case 'medium':
        return this.mediumLogic(bot, state, callAmount, handScore);
      case 'expert':
        return this.expertLogic(bot, state, callAmount, handScore);
      default:
        return { playerId: bot.id, type: 'CHECK' };
    }
  }

  static getExpertScores(state: GameState): Record<ActionType, number> {
    const player = state.players[state.activePlayerIndex];
    const result = evaluateHand(player.holeCards, state.communityCards);
    const handScore = result.classRank * 100;
    const currentMaxBet = Math.max(...state.players.map(p => p.currentBet));
    const callAmount = currentMaxBet - player.currentBet;
    
    const action = this.expertLogic(player, state, callAmount, handScore);
    return (action.scores as Record<ActionType, number>) || { FOLD: 0, CHECK: 0, CALL: 0, RAISE: 0 };
  }

  private static easyLogic(bot: Player, state: GameState, callAmount: number, score: number): Action {
    const random = Math.random();
    // Easy bot makes frequent mistakes
    if (callAmount > 0) {
      if (random < 0.3) return { playerId: bot.id, type: 'FOLD' };
      if (random < 0.9) return { playerId: bot.id, type: 'CALL' };
      return { playerId: bot.id, type: 'RAISE', amount: bot.currentBet + callAmount + 20 };
    }
    
    if (random < 0.2) return { playerId: bot.id, type: 'RAISE', amount: 40 };
    return { playerId: bot.id, type: 'CHECK' };
  }

  private static mediumLogic(bot: Player, state: GameState, callAmount: number, score: number): Action {
    // Basic hand strength logic
    if (score > 100) { // Pair or better
        if (callAmount > 0) return { playerId: bot.id, type: 'CALL' };
        return { playerId: bot.id, type: 'RAISE', amount: Math.max(state.pot / 2, 40) + bot.currentBet };
    }
    
    if (callAmount > 0) {
        if (callAmount > bot.stack / 4) return { playerId: bot.id, type: 'FOLD' };
        return { playerId: bot.id, type: 'CALL' };
    }
    
    return { playerId: bot.id, type: 'CHECK' };
  }

  private static expertLogic(bot: Player, state: GameState, callAmount: number, score: number): Action {
    // More aggressive and pot-odds aware
    const totalPot = state.pot + callAmount;
    const potOdds = totalPot > 0 ? callAmount / totalPot : 0;
    
    // Scale hand strength requirements by street
    let threshold = 200; // Flop
    if (state.stage === 'TURN') threshold = 300;
    if (state.stage === 'RIVER') threshold = 400;

    const scores: Record<ActionType, number> = {
      FOLD: 0,
      CHECK: 0,
      CALL: 0,
      RAISE: 0
    };

    if (callAmount > 0) {
      // Facing a bet
      if (score > threshold) {
        scores.RAISE = 0.7;
        scores.CALL = 0.3;
        scores.FOLD = 0.0;
      } else if (score > threshold / 2 || potOdds < 0.25) {
        scores.RAISE = 0.1;
        scores.CALL = 0.8;
        scores.FOLD = 0.1;
      } else {
        scores.RAISE = 0.05;
        scores.CALL = 0.15;
        scores.FOLD = 0.8;
      }
    } else {
      // Not facing a bet
      if (score > threshold) {
        scores.RAISE = 0.8;
        scores.CHECK = 0.2;
      } else {
        scores.RAISE = 0.15; // Semi-bluff
        scores.CHECK = 0.85;
      }
    }

    // Pick highest score
    let type: ActionType = 'CHECK';
    let maxScore = -1;
    for (const [t, s] of Object.entries(scores)) {
      if (s > maxScore) {
        maxScore = s;
        type = t as ActionType;
      }
    }

    const action: Action = { playerId: bot.id, type, scores };
    
    if (type === 'RAISE') {
      action.amount = (callAmount > 0 ? Math.floor(state.pot * 0.75) : Math.floor(state.pot / 2)) + bot.currentBet;
      if (action.amount < 40) action.amount = 40; // Min raise
    }
    
    return action;
  }
}
