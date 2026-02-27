import { describe, it } from 'node:test';
import assert from 'node:assert';
import { handleAction } from '../betting';
import { GameState, Player } from '../types';

describe('Credit Mode Logic', () => {
  const createPlayer = (id: string, stack: number): Player => ({
    id,
    name: id,
    stack,
    holeCards: [],
    currentBet: 0,
    totalBet: 0,
    hasActed: false,
    isFolded: false,
  });

  it('should go all-in when raising more than stack (creditMode OFF)', () => {
    const state: GameState = {
      stage: 'FLOP',
      pot: 0,
      players: [createPlayer('p1', 50), createPlayer('p2', 1000)],
      activePlayerIndex: 0,
      dealerIndex: 1,
      lastRaiseAmount: 0,
    };

    // p1 tries to raise to 100 but only has 50. Should raise to 50.
    const newState = handleAction(state, { playerId: 'p1', type: 'RAISE', amount: 100 }, false);
    assert.strictEqual(newState.players[0].stack, 0);
    assert.strictEqual(newState.players[0].currentBet, 50);
    assert.strictEqual(newState.pot, 50);
  });

  it('should allow betting below 0 when creditMode is ON and within limit', () => {
    const state: GameState = {
      stage: 'FLOP',
      pot: 0,
      players: [createPlayer('p1', 50), createPlayer('p2', 1000)],
      activePlayerIndex: 0,
      dealerIndex: 1,
      lastRaiseAmount: 0,
    };

    // p1 raises to 100 (needs 100 chips, has 50, goes to -50)
    const newState = handleAction(state, { playerId: 'p1', type: 'RAISE', amount: 100 }, true, -2000);
    assert.strictEqual(newState.players[0].stack, -50);
    assert.strictEqual(newState.pot, 100);
  });

  it('should cap raise at credit limit if raise exceeds it', () => {
    const state: GameState = {
      stage: 'FLOP',
      pot: 0,
      players: [createPlayer('p1', -1950), createPlayer('p2', 1000)],
      activePlayerIndex: 0,
      dealerIndex: 1,
      lastRaiseAmount: 0,
    };

    // p1 tries to raise to 100 (needs 100 chips, has -1950, would go to -2050, limit -2000). 
    // Should cap at -2000 (adding 50 chips).
    const newState = handleAction(state, { playerId: 'p1', type: 'RAISE', amount: 100 }, true, -2000);
    assert.strictEqual(newState.players[0].stack, -2000);
    assert.strictEqual(newState.players[0].currentBet, 50);
    assert.strictEqual(newState.pot, 50);
  });

  it('should cap CALL at available credit limit', () => {
    const state: GameState = {
      stage: 'FLOP',
      pot: 100,
      players: [
        { ...createPlayer('p1', 1000), currentBet: 100 },
        { ...createPlayer('p2', -1950), currentBet: 0 }
      ],
      activePlayerIndex: 1,
      dealerIndex: 0,
      lastRaiseAmount: 100,
    };

    // p2 calls 100 but only has 50 credit left (-1950 - (-2000) = 50)
    const newState = handleAction(state, { playerId: 'p2', type: 'CALL' }, true, -2000);
    assert.strictEqual(newState.players[1].stack, -2000);
    assert.strictEqual(newState.players[1].currentBet, 50);
    assert.strictEqual(newState.pot, 150);
  });
});
