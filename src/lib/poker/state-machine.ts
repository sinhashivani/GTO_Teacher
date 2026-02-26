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

  initializeGame(playerData: { id: string, name: string }[]): GameState {
    this.deck.reset();
    this.deck.shuffle();

    const numPlayers = playerData.length;
    const dealerIndex = 0; // Fixed for start, can rotate in higher level logic
    
    let sbIndex, bbIndex, firstActorIndex;

    if (numPlayers === 2) {
      // Heads-up: Dealer is SB
      sbIndex = dealerIndex;
      bbIndex = (dealerIndex + 1) % numPlayers;
      firstActorIndex = sbIndex;
    } else {
      // Multiplayer (3+)
      sbIndex = (dealerIndex + 1) % numPlayers;
      bbIndex = (dealerIndex + 2) % numPlayers;
      firstActorIndex = (dealerIndex + 3) % numPlayers;
    }

    const players: Player[] = playerData.map((p, i) => {
      let currentBet = 0;
      let stack = this.initialStack;

      if (i === sbIndex) {
        currentBet = Math.min(this.smallBlind, stack);
        stack -= currentBet;
      } else if (i === bbIndex) {
        currentBet = Math.min(this.bigBlind, stack);
        stack -= currentBet;
      }

      return {
        id: p.id,
        name: p.name,
        stack,
        holeCards: this.deck.draw(2),
        currentBet,
        hasActed: false,
        isFolded: false,
      };
    });

    return {
      stage: 'PREFLOP',
      pot: players.reduce((sum, p) => sum + p.currentBet, 0),
      communityCards: [],
      players,
      activePlayerIndex: firstActorIndex,
      dealerIndex,
      lastRaiseAmount: this.bigBlind,
    };
  }

  transitionToStage(state: GameState, nextStage: GameStage): GameState {
    const numToDraw = nextStage === 'FLOP' ? 3 : (nextStage === 'TURN' || nextStage === 'RIVER' ? 1 : 0);
    const newCards = numToDraw > 0 ? this.deck.draw(numToDraw) : [];

    // Reset players for new betting round
    const players = state.players.map(p => ({
      ...p,
      currentBet: 0,
      hasActed: false,
    }));

    // Post-flop: SB acts first, or the next non-folded player after the dealer
    const firstActor = this.getPostFlopFirstActor(state.dealerIndex, players);

    return {
      ...state,
      stage: nextStage,
      communityCards: [...state.communityCards, ...newCards],
      players,
      activePlayerIndex: firstActor,
      lastRaiseAmount: 0,
      lastAction: undefined,
    };
  }

  private getPostFlopFirstActor(dealerIndex: number, players: Player[]): number {
    const numPlayers = players.length;
    for (let i = 1; i <= numPlayers; i++) {
      const nextIndex = (dealerIndex + i) % numPlayers;
      if (!players[nextIndex].isFolded && players[nextIndex].stack > 0) {
        return nextIndex;
      }
    }
    // If only one player left with chips, they technically don't have to act, but we need an index
    for (let i = 1; i <= numPlayers; i++) {
      const nextIndex = (dealerIndex + i) % numPlayers;
      if (!players[nextIndex].isFolded) return nextIndex;
    }
    return -1;
  }

  transitionToFlop(state: GameState): GameState {
    return this.transitionToStage(state, 'FLOP');
  }

  transitionToTurn(state: GameState): GameState {
    return this.transitionToStage(state, 'TURN');
  }

  transitionToRiver(state: GameState): GameState {
    return this.transitionToStage(state, 'RIVER');
  }
}
