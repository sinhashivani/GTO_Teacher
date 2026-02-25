import { GameState, Action, Player } from './types';

export function handleAction(state: GameState, action: Action): GameState {
  const activePlayer = state.players[state.activePlayerIndex];
  const opponentIndex = (state.activePlayerIndex + 1) % 2;
  const opponent = state.players[opponentIndex];

  let nextState = { ...state, players: [...state.players] };
  let playerUpdate = { ...activePlayer, hasActed: true };
  let opponentUpdate = { ...opponent };

  switch (action.type) {
    case 'FOLD':
      nextState.winnerId = opponent.id;
      nextState.stage = 'SHOWDOWN';
      playerUpdate.isFolded = true;
      break;

    case 'CHECK':
      // Valid if currentBet matches opponent's currentBet
      if (activePlayer.currentBet !== opponent.currentBet) {
        throw new Error('Cannot check: there is an outstanding bet.');
      }
      break;

    case 'CALL':
      const callAmount = opponent.currentBet - activePlayer.currentBet;
      if (callAmount > activePlayer.stack) {
        // All-in scenario (simplified for v1)
        playerUpdate.currentBet += activePlayer.stack;
        nextState.pot += activePlayer.stack;
        playerUpdate.stack = 0;
      } else {
        playerUpdate.currentBet += callAmount;
        nextState.pot += callAmount;
        playerUpdate.stack -= callAmount;
      }
      break;

    case 'RAISE':
      if (!action.amount) throw new Error('Raise amount required');
      const totalRaise = action.amount;
      const raiseRequired = totalRaise - activePlayer.currentBet;
      
      if (raiseRequired > activePlayer.stack) throw new Error('Insufficient chips');
      
      playerUpdate.currentBet = totalRaise;
      playerUpdate.stack -= raiseRequired;
      nextState.pot += raiseRequired;
      nextState.lastRaiseAmount = totalRaise - opponent.currentBet;
      
      // Opponent needs to act again after a raise
      opponentUpdate.hasActed = false;
      break;
  }

  nextState.players[state.activePlayerIndex] = playerUpdate;
  nextState.players[opponentIndex] = opponentUpdate;

  // Check if round is over
  const roundOver = nextState.players.every(p => p.hasActed || p.isFolded) && 
                    (nextState.players[0].currentBet === nextState.players[1].currentBet || nextState.stage === 'SHOWDOWN');

  if (roundOver && nextState.stage !== 'SHOWDOWN') {
    // Return flag or handle transition outside
    return { ...nextState, activePlayerIndex: -1 }; // -1 signals round end
  }

  nextState.activePlayerIndex = opponentIndex;
  return nextState;
}
