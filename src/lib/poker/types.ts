export type Suit = 'h' | 'd' | 's' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type HandCategory =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface HandResult {
  handClass: HandCategory;
  classRank: number;
  best5: Card[];
  tiebreak: number[];
  handValue: number[]; // comparable tuple: [classRank, ...tiebreak]
  description: string;
}

export type GameStage = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN' | 'END';

export type ActionType = 'FOLD' | 'CHECK' | 'CALL' | 'RAISE';

export interface Action {
  playerId: string;
  type: ActionType;
  amount?: number;
  scores?: Partial<Record<ActionType, number>>;
  deviation?: {
    recommended: ActionType;
    rationale: string;
  };
  coaching?: {
    recommended: ActionType;
    why: string;
    whatChanges?: string;
    confidence: 'baseline' | 'heuristic' | 'lookup';
    alternatives: { type: ActionType; reason: string }[];
  };
}

export interface SidePot {
  amount: number;
  participants: number[]; // Player indices
}

export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO';

export interface Player {
  id: string;
  name: string;
  stack: number;
  holeCards: Card[];
  currentBet: number;
  totalBet: number; // Total chips contributed to the pot in this hand
  hasActed: boolean;
  isFolded: boolean;
  position?: Position;
  difficulty?: string; // For bot quit logic
}

export interface GameState {
  stage: GameStage;
  pot: number;
  sidePots?: SidePot[];
  communityCards: Card[];
  players: Player[];
  activePlayerIndex: number;
  dealerIndex: number;
  lastRaiseAmount: number;
  lastAction?: Action;
  winnerId?: string;
  winners?: string[]; // For split pots
  actionLog?: Action[]; // History of actions in this hand
}
