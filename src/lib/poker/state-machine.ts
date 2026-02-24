import { Deck } from './deck';
import { GameState, Action, Player, GameStage } from './types';
import { Card } from './card';

export class PokerGame {
  private deck: Deck;

  constructor(
    private initialStack: number = 1000,
    private smallBlind: number = 10,
    private bigBlind: number = 20
  ) {
    this.deck = new Deck();
  }

  initializeGame(player1Id: string, player2Id: string): GameState {
    this.deck.reset();
    this.deck.shuffle();

    const players: Player[] = [
      {
        id: player1Id,
        stack: this.initialStack - this.smallBlind,
        holeCards: this.deck.draw(2),
        currentBet: this.smallBlind,
        hasActed: false,
      },
      {
        id: player2Id,
        stack: this.initialStack - this.bigBlind,
        holeCards: this.deck.draw(2),
        currentBet: this.bigBlind,
        hasActed: false,
      },
    ];

    return {
      stage: 'PREFLOP',
      pot: this.smallBlind + this.bigBlind,
      communityCards: [],
      players,
      activePlayerIndex: 0, // SB acts first in heads-up preflop
      lastRaiseAmount: this.bigBlind,
    };
  }

  transitionToFlop(state: GameState): GameState {
    const communityCards = this.deck.draw(3);
    
    // Reset players for new betting round
    const players = state.players.map(p => ({
      ...p,
      currentBet: 0,
      hasActed: false,
    }));

    return {
      ...state,
      stage: 'FLOP',
      communityCards,
      players,
      activePlayerIndex: 1, // BB acts first on post-flop streets in heads-up
      lastRaiseAmount: 0,
    };
  }
}
