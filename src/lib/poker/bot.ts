import { GameState, Action, ActionType, Player } from './types';
import { evaluateHand } from './evaluator';

export type BotDifficulty = 'easy' | 'medium' | 'expert' | 'mixed';

export class BotAI {
  static getAction(state: GameState, difficulty: BotDifficulty): Action {
    const bot = state.players[state.activePlayerIndex];
    
    // Evaluate hand strength
    const result = evaluateHand(bot.holeCards, state.communityCards);
    const handScore = result.score;
    const currentMaxBet = Math.max(...state.players.map(p => p.currentBet));
    const callAmount = currentMaxBet - bot.currentBet;
    
    let effectiveDifficulty = difficulty;
    if (difficulty === 'mixed') {
      // Deterministic difficulty based on seat index for "Mixed" mode
      const levels: BotDifficulty[] = ['easy', 'medium', 'expert'];
      effectiveDifficulty = levels[state.activePlayerIndex % 3] as BotDifficulty;
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
    const potOdds = callAmount / totalPot;
    
    // Scale hand strength requirements by street
    let threshold = 200; // Flop
    if (state.stage === 'TURN') threshold = 300;
    if (state.stage === 'RIVER') threshold = 400;

    if (score > threshold) {
      return { playerId: bot.id, type: 'RAISE', amount: Math.floor(state.pot * 0.75) + bot.currentBet };
    }
    
    if (callAmount > 0) {
        // Simple equity vs odds approximation
        if (score > threshold / 2 || potOdds < 0.25) return { playerId: bot.id, type: 'CALL' };
        return { playerId: bot.id, type: 'FOLD' };
    }
    
    // Bluff or value bet
    if (Math.random() < 0.15) return { playerId: bot.id, type: 'RAISE', amount: Math.floor(state.pot / 2) + bot.currentBet };
    return { playerId: bot.id, type: 'CHECK' };
  }
}
