import { GameState, Action, Player, SidePot } from './types';

export function handleAction(state: GameState, action: Action): GameState {
  const activePlayer = state.players[state.activePlayerIndex];
  const numPlayers = state.players.length;

  let nextState = { 
    ...state, 
    players: state.players.map(p => ({ ...p })),
    lastAction: action
  };
  let playerUpdate = nextState.players[state.activePlayerIndex];
  playerUpdate.hasActed = true;

  const currentMaxBet = Math.max(...nextState.players.map(p => p.currentBet));

  switch (action.type) {
    case 'FOLD':
      playerUpdate.isFolded = true;
      break;

    case 'CHECK':
      if (playerUpdate.currentBet < currentMaxBet) {
        throw new Error('Cannot check: there is an outstanding bet.');
      }
      break;

    case 'CALL':
      const callAmount = currentMaxBet - playerUpdate.currentBet;
      const actualCall = Math.min(callAmount, playerUpdate.stack);
      playerUpdate.currentBet += actualCall;
      playerUpdate.stack -= actualCall;
      nextState.pot += actualCall;
      break;

    case 'RAISE':
      if (!action.amount) throw new Error('Raise amount required');
      const totalRaise = action.amount;
      const raiseRequired = totalRaise - playerUpdate.currentBet;
      
      if (raiseRequired > playerUpdate.stack) throw new Error('Insufficient chips');
      if (totalRaise <= currentMaxBet) throw new Error('Raise must be greater than current bet');
      
      nextState.lastRaiseAmount = totalRaise - currentMaxBet;
      playerUpdate.currentBet = totalRaise;
      playerUpdate.stack -= raiseRequired;
      nextState.pot += raiseRequired;
      
      // All other non-folded players must act again if they have chips
      nextState.players.forEach((p, i) => {
        if (i !== state.activePlayerIndex && !p.isFolded && p.stack > 0) {
          p.hasActed = false;
        }
      });
      break;
  }

  // Check if hand is over (only one player left)
  const nonFoldedPlayers = nextState.players.filter(p => !p.isFolded);
  if (nonFoldedPlayers.length === 1) {
    nextState.winnerId = nonFoldedPlayers[0].id;
    nextState.stage = 'SHOWDOWN';
    return nextState;
  }

  // Check if round is over
  const allActed = nextState.players.every(p => p.isFolded || p.hasActed || p.stack === 0);
  const maxBet = Math.max(...nextState.players.map(p => p.currentBet));
  const betsMatched = nextState.players.every(p => p.isFolded || p.stack === 0 || p.currentBet === maxBet);

  if (allActed && betsMatched) {
    return { ...nextState, activePlayerIndex: -1 };
  }

  // Find next player
  nextState.activePlayerIndex = getNextToAct(nextState, state.activePlayerIndex);
  
  if (nextState.activePlayerIndex === -1) {
    return { ...nextState, activePlayerIndex: -1 };
  }

  return nextState;
}

function getNextToAct(state: GameState, currentIndex: number): number {
  const numPlayers = state.players.length;
  const maxBet = Math.max(...state.players.map(p => p.currentBet));

  for (let i = 1; i <= numPlayers; i++) {
    const nextIndex = (currentIndex + i) % numPlayers;
    const p = state.players[nextIndex];
    
    // Player can act if they haven't folded, have chips, and:
    // 1. Haven't acted this round OR
    // 2. Haven't matched the current max bet
    if (!p.isFolded && p.stack > 0 && (!p.hasActed || p.currentBet < maxBet)) {
      return nextIndex;
    }
  }
  return -1;
}

export function calculateSidePots(players: Player[]): SidePot[] {
  const activeBets = players
    .map((p, i) => ({ bet: p.currentBet, index: i, isFolded: p.isFolded }))
    .filter(p => p.bet > 0);

  if (activeBets.length === 0) return [];

  const sortedUniqueBets = [...new Set(activeBets.map(b => b.bet))].sort((a, b) => a - b);
  const sidePots: SidePot[] = [];
  let lastAmount = 0;

  for (const amount of sortedUniqueBets) {
    const participants = activeBets
      .filter(b => !b.isFolded && b.bet >= amount)
      .map(b => b.index);

    if (participants.length > 0) {
      const contributions = activeBets
        .filter(b => b.bet >= lastAmount)
        .map(b => Math.min(b.bet, amount) - lastAmount)
        .reduce((sum, val) => sum + val, 0);

      if (contributions > 0) {
        sidePots.push({ amount: contributions, participants });
      }
    }
    lastAmount = amount;
  }

  return sidePots;
}
