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
    playerData: { id: string, name: string, isEmpty?: boolean, difficulty?: string, initialStack?: number, thresholdType?: string }[], 
    creditMode: boolean = false, 
    creditLimit: number = -2000,
    dealerIndex: number = 0,
    overrideBlinds?: { sb: number, bb: number }
  ): GameState {
    this.deck.reset();
    this.deck.shuffle();

    // Blind scaling by difficulty if not overridden
    const firstBot = playerData.find(p => p.difficulty);
    const diff = (firstBot?.difficulty || 'medium') as any;
    const sb = overrideBlinds?.sb || (diff === 'easy' ? 50 : diff === 'medium' ? 150 : diff === 'expert' ? 1500 : 500);
    const bb = overrideBlinds?.bb || (diff === 'easy' ? 100 : diff === 'medium' ? 300 : diff === 'expert' ? 3000 : 1000);

    const activePlayersIndices = playerData
      .map((p, i) => p.isEmpty ? -1 : i)
      .filter(i => i !== -1);
    
    const numActivePlayers = activePlayersIndices.length;
    
    // Position indices within activePlayersIndices
    let sbActiveIdx = -1;
    let bbActiveIdx = -1;
    let firstActorActiveIdx = -1;

    if (numActivePlayers === 2) {
      sbActiveIdx = activePlayersIndices.indexOf(dealerIndex);
      if (sbActiveIdx === -1) {
         sbActiveIdx = 0;
      }
      bbActiveIdx = (sbActiveIdx + 1) % numActivePlayers;
      firstActorActiveIdx = sbActiveIdx;
    } else {
      const dealerActiveIdx = activePlayersIndices.indexOf(dealerIndex);
      const baseIdx = dealerActiveIdx === -1 ? 0 : dealerActiveIdx;
      sbActiveIdx = (baseIdx + 1) % numActivePlayers;
      bbActiveIdx = (baseIdx + 2) % numActivePlayers;
      firstActorActiveIdx = (baseIdx + 3) % numActivePlayers;
    }

    const sbActualIndex = activePlayersIndices[sbActiveIdx];
    const bbActualIndex = activePlayersIndices[bbActiveIdx];
    const firstActorActualIndex = activePlayersIndices[firstActorActiveIdx];

    const players: Player[] = playerData.map((p, i) => {
      if (p.isEmpty) {
        return {
          id: p.id,
          name: "Empty Seat",
          stack: 0,
          holeCards: [],
          currentBet: 0,
          totalBet: 0,
          hasActed: true,
          isFolded: true,
          isAllIn: false,
          isEmpty: true,
        };
      }

      let currentBet = 0;
      let stack = p.initialStack || 1000;

      if (i === sbActualIndex) {
        currentBet = Math.min(sb, creditMode ? (stack - creditLimit) : stack);
        stack -= currentBet;
      } else if (i === bbActualIndex) {
        currentBet = Math.min(bb, creditMode ? (stack - creditLimit) : stack);
        stack -= currentBet;
      }

      const activeIdx = activePlayersIndices.indexOf(i);
      const dealerActiveIdx = activePlayersIndices.indexOf(dealerIndex);
      const relativeToDealer = (activeIdx - (dealerActiveIdx === -1 ? 0 : dealerActiveIdx) + numActivePlayers) % numActivePlayers;
      
      return {
        id: p.id,
        name: p.name,
        stack,
        difficulty: p.difficulty,
        initialStack: p.initialStack,
        thresholdType: p.thresholdType as any,
        holeCards: this.deck.draw(2),
        currentBet,
        totalBet: currentBet,
        hasActed: false,
        isFolded: false,
        isAllIn: stack <= (creditMode ? creditLimit : 0),
        position: PokerGame.getPositionMapping(0, numActivePlayers)[relativeToDealer],
      };
    });

    let finalFirstActor = -1;
    for (let i = 0; i < numActivePlayers; i++) {
      const checkIdx = (activePlayersIndices.indexOf(firstActorActualIndex) + i) % numActivePlayers;
      const actualCheckIdx = activePlayersIndices[checkIdx];
      const hasCredit = players[actualCheckIdx].stack > (creditMode ? creditLimit : 0);
      if (!players[actualCheckIdx].isFolded && !players[actualCheckIdx].isAllIn && hasCredit) {
        finalFirstActor = actualCheckIdx;
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
      lastRaiseAmount: bb,
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
      isAllIn: p.isAllIn || (p.stack <= (creditMode ? creditLimit : 0) && !p.isFolded),
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
    
    // Betting can only happen if at least 2 players have credit and aren't all-in
    const playersWithCredit = players.filter(p => !p.isFolded && !p.isAllIn && p.stack > (creditMode ? creditLimit : 0));
    if (playersWithCredit.length <= 1) {
      return -1;
    }

    for (let i = 1; i <= numPlayers; i++) {
      const nextIndex = (dealerIndex + i) % numPlayers;
      if (!players[nextIndex].isFolded && !players[nextIndex].isAllIn && players[nextIndex].stack > (creditMode ? creditLimit : 0)) {
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
