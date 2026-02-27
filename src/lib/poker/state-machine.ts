import { Deck } from './deck';
import { GameState, Action, Player, GameStage, Position } from './types';
import { getBankroll } from './bankroll';

export class PokerGame {
  private deck: Deck;

  constructor(
    private initialStack: number = 1000,
    private smallBlind: number = 10,
    private bigBlind: number = 20
  ) {
    this.deck = new Deck();
  }

  static getPositionMapping(dealerIndex: number, numPlayers: number): Record<number, Position> {
    const mapping: Record<number, Position> = {};
    
    if (numPlayers === 2) {
      mapping[dealerIndex] = 'SB'; // Also BTN, but SB takes precedence for HUD
      mapping[(dealerIndex + 1) % numPlayers] = 'BB';
      return mapping;
    }

    // Standard positions relative to dealer
    const positions: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];
    
    if (numPlayers === 3) {
      mapping[dealerIndex] = 'BTN';
      mapping[(dealerIndex + 1) % numPlayers] = 'SB';
      mapping[(dealerIndex + 2) % numPlayers] = 'BB';
    } else if (numPlayers === 4) {
      mapping[dealerIndex] = 'BTN';
      mapping[(dealerIndex + 1) % numPlayers] = 'SB';
      mapping[(dealerIndex + 2) % numPlayers] = 'BB';
      mapping[(dealerIndex + 3) % numPlayers] = 'CO';
    } else if (numPlayers === 5) {
      mapping[dealerIndex] = 'BTN';
      mapping[(dealerIndex + 1) % numPlayers] = 'SB';
      mapping[(dealerIndex + 2) % numPlayers] = 'BB';
      mapping[(dealerIndex + 3) % numPlayers] = 'HJ';
      mapping[(dealerIndex + 4) % numPlayers] = 'CO';
    } else if (numPlayers === 6) {
      mapping[dealerIndex] = 'BTN';
      mapping[(dealerIndex + 1) % numPlayers] = 'SB';
      mapping[(dealerIndex + 2) % numPlayers] = 'BB';
      mapping[(dealerIndex + 3) % numPlayers] = 'UTG';
      mapping[(dealerIndex + 4) % numPlayers] = 'HJ';
      mapping[(dealerIndex + 5) % numPlayers] = 'CO';
    }

    return mapping;
  }

  initializeGame(
    playerData: { id: string, name: string }[], 
    creditMode: boolean = false, 
    creditLimit: number = -2000,
    dealerIndex: number = 0
  ): GameState {
    this.deck.reset();
    this.deck.shuffle();

    const numPlayers = playerData.length;
    const positionMapping = PokerGame.getPositionMapping(dealerIndex, numPlayers);
    
    let sbIndex = -1;
    let bbIndex = -1;
    let firstActorIndex = -1;

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
      let stack = getBankroll(p.id, this.initialStack);

      if (i === sbIndex) {
        currentBet = Math.min(this.smallBlind, creditMode ? (stack - creditLimit) : stack);
        stack -= currentBet;
      } else if (i === bbIndex) {
        currentBet = Math.min(this.bigBlind, creditMode ? (stack - creditLimit) : stack);
        stack -= currentBet;
      }

      return {
        id: p.id,
        name: p.name,
        stack,
        holeCards: this.deck.draw(2),
        currentBet,
        totalBet: currentBet,
        hasActed: false,
        isFolded: false,
        position: positionMapping[i],
      };
    });

    // Ensure the first actor actually has credit
    let finalFirstActor = -1;
    for (let i = 0; i < numPlayers; i++) {
      const checkIndex = (firstActorIndex + i) % numPlayers;
      const hasCredit = players[checkIndex].stack > (creditMode ? creditLimit : 0);
      if (!players[checkIndex].isFolded && hasCredit) {
        finalFirstActor = checkIndex;
        break;
      }
    }

    return {
      stage: 'PREFLOP',
      pot: players.reduce((sum, p) => sum + p.currentBet, 0),
      communityCards: [],
      players,
      activePlayerIndex: finalFirstActor,
      dealerIndex,
      lastRaiseAmount: this.bigBlind,
      actionLog: [],
    };
  }

  transitionToStage(
    state: GameState, 
    nextStage: GameStage,
    creditMode: boolean = false,
    creditLimit: number = -2000
  ): GameState {
    const numToDraw = nextStage === 'FLOP' ? 3 : (nextStage === 'TURN' || nextStage === 'RIVER' ? 1 : 0);
    const newCards = numToDraw > 0 ? this.deck.draw(numToDraw) : [];

    // Reset players for new betting round
    const players = state.players.map(p => ({
      ...p,
      currentBet: 0,
      hasActed: false,
    }));

    // Post-flop: SB acts first, or the next non-folded player after the dealer
    const firstActor = this.getPostFlopFirstActor(state.dealerIndex, players, creditMode, creditLimit);

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

  static getPublicState(state: GameState, playerId: string): GameState {
    const hero = state.players.find(p => p.id === playerId);
    const heroFolded = hero?.isFolded || false;

    return {
      ...state,
      players: state.players.map(p => ({
        ...p,
        holeCards: (p.id === playerId || state.stage === 'SHOWDOWN' || (heroFolded && !p.isFolded)) 
          ? [...p.holeCards] 
          : []
      }))
    };
  }

  private getPostFlopFirstActor(
    dealerIndex: number, 
    players: Player[],
    creditMode: boolean = false,
    creditLimit: number = -2000
  ): number {
    const numPlayers = players.length;
    
    // Betting can only happen if at least 2 players have credit
    const playersWithCredit = players.filter(p => !p.isFolded && p.stack > (creditMode ? creditLimit : 0));
    if (playersWithCredit.length <= 1) {
      return -1;
    }

    for (let i = 1; i <= numPlayers; i++) {
      const nextIndex = (dealerIndex + i) % numPlayers;
      if (!players[nextIndex].isFolded && players[nextIndex].stack > (creditMode ? creditLimit : 0)) {
        return nextIndex;
      }
    }
    
    return -1;
  }

  transitionToFlop(state: GameState, creditMode?: boolean, creditLimit?: number): GameState {
    return this.transitionToStage(state, 'FLOP', creditMode, creditLimit);
  }

  transitionToTurn(state: GameState, creditMode?: boolean, creditLimit?: number): GameState {
    return this.transitionToStage(state, 'TURN', creditMode, creditLimit);
  }

  transitionToRiver(state: GameState, creditMode?: boolean, creditLimit?: number): GameState {
    return this.transitionToStage(state, 'RIVER', creditMode, creditLimit);
  }
}
