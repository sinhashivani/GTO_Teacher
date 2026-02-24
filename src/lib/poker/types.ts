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
  score: number;
  category: HandCategory;
  name: string;
}

export type GameStage = 'PREFLOP' | 'FLOP' | 'SHOWDOWN';

export type ActionType = 'FOLD' | 'CHECK' | 'CALL' | 'RAISE';

export interface Action {
  type: ActionType;
  amount?: number;
}

export interface Player {
  id: string;
  stack: number;
  holeCards: Card[];
  currentBet: number;
  hasActed: boolean;
}

export interface GameState {
  stage: GameStage;
  pot: number;
  communityCards: Card[];
  players: Player[];
  activePlayerIndex: number;
  lastRaiseAmount: number;
  winner?: string;
}

export type GameStage = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN' | 'END';

export interface Player {
  id: string;
  name: string;
  stack: number;
  holeCards: Card[];
  currentBet: number;
  hasActed: boolean;
  isFolded: boolean;
}

export interface GameState {
  stage: GameStage;
  pot: number;
  communityCards: Card[];
  players: Player[];
  activePlayerIndex: number;
  dealerIndex: number;
  lastAction?: Action;
  winnerId?: string;
}

export type ActionType = 'FOLD' | 'CHECK' | 'CALL' | 'RAISE';

export interface Action {
  playerId: string;
  type: ActionType;
  amount?: number;
}
