import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PokerGame } from '../state-machine';
import { handleAction } from '../betting';

describe('Poker Engine', () => {
  it('should play a full preflop round and transition to flop', () => {
    const game = new PokerGame(1000, 10, 20);
    let state = game.initializeGame('player1', 'player2');

    assert.strictEqual(state.stage, 'PREFLOP');
    assert.strictEqual(state.pot, 30);
    assert.strictEqual(state.activePlayerIndex, 0); // SB

    // SB Calls
    state = handleAction(state, { type: 'CALL' });
    assert.strictEqual(state.activePlayerIndex, 1); // BB
    assert.strictEqual(state.pot, 40);

    // BB Checks
    state = handleAction(state, { type: 'CHECK' });
    
    // -1 signals round end in our handleAction implementation
    assert.strictEqual(state.activePlayerIndex, -1);

    // Transition to Flop
    state = game.transitionToFlop(state);
    assert.strictEqual(state.stage, 'FLOP');
    assert.strictEqual(state.communityCards.length, 3);
    assert.strictEqual(state.activePlayerIndex, 1); // BB acts first on Flop
  });

  it('should end hand on FOLD', () => {
    const game = new PokerGame(1000, 10, 20);
    let state = game.initializeGame('player1', 'player2');

    // SB Folds
    state = handleAction(state, { type: 'FOLD' });
    assert.strictEqual(state.stage, 'SHOWDOWN');
    assert.strictEqual(state.winner, 'player2');
  });
});
