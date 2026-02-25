import { GameState, Action, ActionType, Player } from './types';
import { evaluateHand } from './evaluator';

export type BotDifficulty = 'easy' | 'medium' | 'expert';

export class BotAI {
  static getAction(state: GameState, difficulty: BotDifficulty): Action {
    const bot = state.players[state.activePlayerIndex];
    const opponent = state.players[(state.activePlayerIndex + 1) % 2];
    
    // Evaluate hand strength
    const result = evaluateHand(bot.holeCards, state.communityCards);
    const handScore = result.score;
    const callAmount = opponent.currentBet - bot.currentBet;
    
    switch (difficulty) {
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
    const potOdds = callAmount / (state.pot + callAmount);
    
    if (score > 200) { // High Pair, Two Pair+
      return { playerId: bot.id, type: 'RAISE', amount: state.pot + bot.currentBet };
    }
    
    if (callAmount > 0) {
        if (score > 50 || potOdds < 0.3) return { playerId: bot.id, type: 'CALL' };
        return { playerId: bot.id, type: 'FOLD' };
    }
    
    if (Math.random() < 0.2) return { playerId: bot.id, type: 'RAISE', amount: state.pot / 2 + bot.currentBet };
    return { playerId: bot.id, type: 'CHECK' };
  }
}
