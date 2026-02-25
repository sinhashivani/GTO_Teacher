import { Deck } from './deck';
import { GameState, Action, Player, GameStage } from './types';

export class PokerGame {
  private deck: Deck;

  constructor(
    private initialStack: number = 1000,
    private smallBlind: number = 10,
    private bigBlind: number = 20
  ) {
    this.deck = new Deck();
  }

  initializeGame(player1Id: string, player1Name: string, player2Id: string, player2Name: string): GameState {
    this.deck.reset();
    this.deck.shuffle();

    const players: Player[] = [
      {
        id: player1Id,
        name: player1Name,
        stack: this.initialStack - this.smallBlind,
        holeCards: this.deck.draw(2),
        currentBet: this.smallBlind,
        hasActed: false,
        isFolded: false,
      },
      {
        id: player2Id,
        name: player2Name,
        stack: this.initialStack - this.bigBlind,
        holeCards: this.deck.draw(2),
        currentBet: this.bigBlind,
        hasActed: false,
        isFolded: false,
      },
    ];

    return {
      stage: 'PREFLOP',
      pot: this.smallBlind + this.bigBlind,
      communityCards: [],
      players,
      activePlayerIndex: 0, // SB acts first in heads-up preflop
      dealerIndex: 0, // Player 1 is dealer
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
      communityCards: [...state.communityCards, ...communityCards],
      players,
      activePlayerIndex: 1, // BB acts first on post-flop streets in heads-up
      lastRaiseAmount: 0,
    };
  }
}
