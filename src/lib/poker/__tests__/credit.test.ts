import { handleAction } from '../betting';
import { GameState, Player, Action } from '../types';

describe('Credit Mode Balance Updates', () => {
  const initialState: GameState = {
    stage: 'PREFLOP',
    pot: 30,
    communityCards: [],
    players: [
      {
        id: 'p1',
        name: 'You',
        stack: -100,
        holeCards: [],
        currentBet: 10,
        totalBet: 10,
        hasActed: false,
        isFolded: false,
      },
      {
        id: 'bot-1',
        name: 'Bot 1',
        stack: 1000,
        holeCards: [],
        currentBet: 20,
        totalBet: 20,
        hasActed: false,
        isFolded: false,
      }
    ],
    activePlayerIndex: 0,
    dealerIndex: 0,
    lastRaiseAmount: 20,
  };

  it('should allow calling even with negative balance in Credit Mode', () => {
    const action: Action = { playerId: 'p1', type: 'CALL' };
    const nextState = handleAction(initialState, action, true, -2000);
    
    const hero = nextState.players[0];
    // currentMaxBet is 20. Hero has 10. Call should be 10.
    // Stack was -100, should be -110.
    expect(hero.stack).toBe(-110);
    expect(hero.currentBet).toBe(20);
    expect(nextState.pot).toBe(40);
  });

  it('should allow raising even with negative balance in Credit Mode', () => {
    const action: Action = { playerId: 'p1', type: 'RAISE', amount: 100 };
    const nextState = handleAction(initialState, action, true, -2000);
    
    const hero = nextState.players[0];
    // Hero raises to 100. Current bet was 10. Required: 90.
    // Stack was -100, should be -190.
    expect(hero.stack).toBe(-190);
    expect(hero.currentBet).toBe(100);
    expect(nextState.pot).toBe(30 + 90);
  });
});
