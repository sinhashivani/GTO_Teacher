import { describe, it } from 'node:test';
import assert from 'node:assert';
import { handleAction } from '../betting';
import { GameState } from '../types';
import { PokerGame } from '../state-machine';

describe('Cannot Check Error Reproduction', () => {
  it('should not throw error if player is all-in and it somehow becomes their turn', () => {
    const state: GameState = {
      stage: 'PREFLOP',
      pot: 30,
      players: [
        { id: 'p1', name: 'P1', stack: 0, holeCards: [], currentBet: 10, hasActed: true, isFolded: false },
        { id: 'p2', name: 'P2', stack: 980, holeCards: [], currentBet: 20, hasActed: false, isFolded: false }
      ],
      activePlayerIndex: 0, // Force turn to P1 who is all-in
      dealerIndex: 0,
      lastRaiseAmount: 20
    };

    // This is what GameController does for all-in Hero
    try {
      const newState = handleAction(state, { playerId: 'p1', type: 'CHECK' });
      assert.fail('Should have thrown "Cannot check: there is an outstanding bet." if logic is as expected');
    } catch (e: any) {
      assert.strictEqual(e.message, 'Cannot check: there is an outstanding bet.');
    }
  });

  it('should find out if getNextToAct returns a player with 0 chips', () => {
    const state: GameState = {
      stage: 'PREFLOP',
      pot: 30,
      players: [
        { id: 'p1', name: 'P1', stack: 990, holeCards: [], currentBet: 10, hasActed: false, isFolded: false },
        { id: 'p2', name: 'P2', stack: 0, holeCards: [], currentBet: 20, hasActed: false, isFolded: false }
      ],
      activePlayerIndex: 0,
      dealerIndex: 0,
      lastRaiseAmount: 20
    };

    // P1 calls. Next actor should be -1 because P2 is all-in
    const newState = handleAction(state, { playerId: 'p1', type: 'CALL' });
    assert.strictEqual(newState.activePlayerIndex, -1, 'Should skip P2 who is all-in');
  });

  it('should handle both players being all-in from blinds in initializeGame', () => {
    const game = new PokerGame(20, 10, 20); // P2 will be all-in on BB
    const state = game.initializeGame([{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }]);
    
    // P1 is SB (10), P2 is BB (20). Both are all-in.
    // P1 stack is 20-10=10. P2 stack is 20-20=0.
    // In Heads-up, SB (P1) is first actor. P1 has stack 10, so P1 is active.
    assert.strictEqual(state.activePlayerIndex, 0);
    assert.strictEqual(state.players[0].stack, 10);
    assert.strictEqual(state.players[1].stack, 0);

    // Now P1 calls/raises? If P1 calls, they are also all-in.
    const newState = handleAction(state, { playerId: 'p1', type: 'CALL' });
    assert.strictEqual(newState.activePlayerIndex, -1, 'Should go to showdown as both are all-in');
  });

  it('should not set activePlayerIndex to a player with 0 stack in initializeGame', () => {
    const game = new PokerGame(10, 10, 20); // P1 all-in on SB, P2 all-in on BB
    const state = game.initializeGame([{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }]);
    
    // Both are all-in. activePlayerIndex should be -1
    // Currently, the engine might be setting it to 0 because the loop doesn't find anyone.
    assert.strictEqual(state.activePlayerIndex, -1, 'Should be -1 as no one can act');
  });
});
