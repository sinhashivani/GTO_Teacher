import { GameState, Action, ActionType, Player } from './types';
import { evaluateHand } from './evaluator';

export type BotDifficulty = 'easy' | 'medium' | 'expert' | 'mixed';

export interface NPCData {
  name: string;
  difficulty: BotDifficulty;
  thresholdType: 'broke' | 'target_1k' | 'profit_200';
}

export class BotAI {
  static NPC_POOL: NPCData[] = [
    // Easy (10)
    { name: "The Drunk Bard", difficulty: "easy", thresholdType: "broke" },
    { name: "The Clumsy Peasant", difficulty: "easy", thresholdType: "broke" },
    { name: "The Jolly Merchant", difficulty: "easy", thresholdType: "target_1k" },
    { name: "The Nervous Squire", difficulty: "easy", thresholdType: "broke" },
    { name: "The Boastful Hunter", difficulty: "easy", thresholdType: "profit_200" },
    { name: "The Silly Shepherd", difficulty: "easy", thresholdType: "broke" },
    { name: "The Sleepy Cook", difficulty: "easy", thresholdType: "broke" },
    { name: "The Gossip Maid", difficulty: "easy", thresholdType: "target_1k" },
    { name: "The Loud Blacksmith", difficulty: "easy", thresholdType: "broke" },
    { name: "The Simple Miller", difficulty: "easy", thresholdType: "profit_200" },
    // Medium (10)
    { name: "The Cunning Rogue", difficulty: "medium", thresholdType: "target_1k" },
    { name: "The Wandering Mercenary", difficulty: "medium", thresholdType: "profit_200" },
    { name: "The Tavern Regular", difficulty: "medium", thresholdType: "target_1k" },
    { name: "The Stoic Guard", difficulty: "medium", thresholdType: "broke" },
    { name: "The Sharp Gambler", difficulty: "medium", thresholdType: "profit_200" },
    { name: "The Traveling Monk", difficulty: "medium", thresholdType: "target_1k" },
    { name: "The Bold Sailor", difficulty: "medium", thresholdType: "broke" },
    { name: "The Grumpy Innkeeper", difficulty: "medium", thresholdType: "target_1k" },
    { name: "The Quiet Scribe", difficulty: "medium", thresholdType: "profit_200" },
    { name: "The Vigilant Ranger", difficulty: "medium", thresholdType: "broke" },
    // Expert (10)
    { name: "The Iron Knight", difficulty: "expert", thresholdType: "profit_200" },
    { name: "The High Sorcerer", difficulty: "expert", thresholdType: "target_1k" },
    { name: "The Mysterious Traveler", difficulty: "expert", thresholdType: "profit_200" },
    { name: "The Noble Earl", difficulty: "expert", thresholdType: "target_1k" },
    { name: "The Master Assassin", difficulty: "expert", thresholdType: "profit_200" },
    { name: "The Wise Sage", difficulty: "expert", thresholdType: "target_1k" },
    { name: "The Ruthless Warlord", difficulty: "expert", thresholdType: "profit_200" },
    { name: "The Arcane Scholar", difficulty: "expert", thresholdType: "target_1k" },
    { name: "The Royal Diplomat", difficulty: "expert", thresholdType: "profit_200" },
    { name: "The Silent Bluffs", difficulty: "expert", thresholdType: "target_1k" },
  ];

  static getRandomNPC(difficulty: BotDifficulty, excludedNames: string[]): NPCData {
    const available = this.NPC_POOL.filter(n => n.difficulty === difficulty && !excludedNames.includes(n.name));
    if (available.length === 0) {
      // If all are excluded, pick any of the correct difficulty
      const anyOfDiff = this.NPC_POOL.filter(n => n.difficulty === difficulty);
      return anyOfDiff[Math.floor(Math.random() * anyOfDiff.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  static shouldBotExit(player: Player): boolean {
    if (player.isEmpty) return false;
    
    const stack = player.stack;
    const initialStack = player.initialStack || 1000;
    const thresholdType = player.thresholdType || 'broke';

    switch (thresholdType) {
      case 'broke':
        // Default broke limit
        const limit = this.getCreditLimit(player.difficulty as BotDifficulty || 'medium');
        return stack <= limit || stack <= 0; // prompt mentioned 0 money
      case 'target_1k':
        return stack >= 1000;
      case 'profit_200':
        return stack >= initialStack * 2;
      default:
        return false;
    }
  }

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

  static isCharacteristicAction(difficulty: BotDifficulty, actionType: ActionType, callAmount: number, score: number): boolean {
    switch (difficulty) {
      case 'easy':
        // Easy bots "characteristically" call when they should fold, or raise randomly
        if (actionType === 'CALL' && score < 100) return true;
        if (actionType === 'RAISE' && Math.random() < 0.2) return true;
        return false;
      case 'medium':
        // Medium bots "characteristically" fold to big bets or play solid but predictable
        if (actionType === 'FOLD' && callAmount > 100) return true;
        if (actionType === 'CHECK' && score < 200) return true;
        return false;
      case 'expert':
        // Expert bots "characteristically" raise for value or bluff with high scores/pot odds
        if (actionType === 'RAISE' && score > 300) return true;
        if (actionType === 'CALL' && callAmount > 0 && score > 200) return true;
        return false;
      default:
        return false;
    }
  }
}
