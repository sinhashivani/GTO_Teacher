import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSidePots, handleAction } from '../betting';
import { PokerGame } from '../state-machine';
import { Player, GameState } from '../types';

describe('Betting Logic', () => {
  it('should subtract chips from stack and add to pot on CALL', () => {
    const initialState: GameState = {
      stage: 'PREFLOP',
      pot: 30, // 10 SB + 20 BB
      players: [
        { id: 'p1', name: 'P1', stack: 990, holeCards: [], currentBet: 10, hasActed: false, isFolded: false },
        { id: 'p2', name: 'P2', stack: 980, holeCards: [], currentBet: 20, hasActed: false, isFolded: false }
      ],
      activePlayerIndex: 0,
      dealerIndex: 0,
      lastRaiseAmount: 20
    };

    // P1 calls 10 more
    const newState = handleAction(initialState, { playerId: 'p1', type: 'CALL' });
    
    assert.strictEqual(newState.players[0].stack, 980); // 990 - 10
    assert.strictEqual(newState.players[0].currentBet, 20);
    assert.strictEqual(newState.pot, 40);
  });

  it('should subtract chips from stack and add to pot on RAISE', () => {
    const initialState: GameState = {
      stage: 'FLOP',
      pot: 40,
      players: [
        { id: 'p1', name: 'P1', stack: 1000, holeCards: [], currentBet: 0, hasActed: false, isFolded: false },
        { id: 'p2', name: 'P2', stack: 1000, holeCards: [], currentBet: 0, hasActed: false, isFolded: false }
      ],
      activePlayerIndex: 0,
      dealerIndex: 1,
      lastRaiseAmount: 0
    };

    // P1 raises to 100
    const newState = handleAction(initialState, { playerId: 'p1', type: 'RAISE', amount: 100 });
    
    assert.strictEqual(newState.players[0].stack, 900); // 1000 - 100
    assert.strictEqual(newState.players[0].currentBet, 100);
    assert.strictEqual(newState.pot, 140); // 40 + 100
  });

  it('should correctly initialize blinds in PokerGame', () => {
    const game = new PokerGame(1000, 10, 20);
    const state = game.initializeGame([{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }]);
    
    // Heads up: Dealer is SB (p1), Other is BB (p2)
    assert.strictEqual(state.players[0].currentBet, 10);
    assert.strictEqual(state.players[0].stack, 990);
    assert.strictEqual(state.players[1].currentBet, 20);
    assert.strictEqual(state.players[1].stack, 980);
    assert.strictEqual(state.pot, 30);
  });

  it('should calculate side pots for 3 players with different all-in amounts', () => {
    const players: Partial<Player>[] = [
      { id: 'p1', currentBet: 100, isFolded: false, stack: 0 },
      { id: 'p2', currentBet: 200, isFolded: false, stack: 0 },
      { id: 'p3', currentBet: 300, isFolded: false, stack: 0 },
    ];

    const pots = calculateSidePots(players as Player[]);
    
    // Pot 1: 100 from all 3 players = 300. Participants: 0, 1, 2
    // Pot 2: (200-100) from p2 and p3 = 200. Participants: 1, 2
    // Pot 3: (300-200) from p3 = 100. Participants: 2
    
    assert.strictEqual(pots.length, 3);
    assert.strictEqual(pots[0].amount, 300);
    assert.deepStrictEqual(pots[0].participants, [0, 1, 2]);
    
    assert.strictEqual(pots[1].amount, 200);
    assert.deepStrictEqual(pots[1].participants, [1, 2]);
    
    assert.strictEqual(pots[2].amount, 100);
    assert.deepStrictEqual(pots[2].participants, [2]);
  });

  it('should ignore folded players in side pot eligibility', () => {
    const players: Partial<Player>[] = [
      { id: 'p1', currentBet: 100, isFolded: true, stack: 0 },
      { id: 'p2', currentBet: 200, isFolded: false, stack: 0 },
      { id: 'p3', currentBet: 200, isFolded: false, stack: 0 },
    ];

    const pots = calculateSidePots(players as Player[]);
    
    // Pot 1: 100 from p1, 100 from p2, 100 from p3 = 300. 
    // BUT p1 is folded, so only p2 and p3 are eligible.
    // Pot 2: (200-100) from p2 and p3 = 200. p2 and p3 eligible.
    
    assert.strictEqual(pots.length, 2);
    assert.strictEqual(pots[0].amount, 300);
    assert.deepStrictEqual(pots[0].participants, [1, 2]);
    
    assert.strictEqual(pots[1].amount, 200);
    assert.deepStrictEqual(pots[1].participants, [1, 2]);
  });
});
