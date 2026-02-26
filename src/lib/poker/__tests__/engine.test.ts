import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PokerGame } from '../state-machine';
import { handleAction } from '../betting';

describe('Poker Engine', () => {
  it('should play a full preflop round and transition to flop', () => {
    const game = new PokerGame(1000, 10, 20);
    let state = game.initializeGame([{ id: 'player1', name: 'Alice' }, { id: 'player2', name: 'Bob' }]);

    assert.strictEqual(state.stage, 'PREFLOP');
    assert.strictEqual(state.pot, 30);
    assert.strictEqual(state.activePlayerIndex, 0); // SB

    // SB Calls
    state = handleAction(state, { playerId: 'player1', type: 'CALL' });
    assert.strictEqual(state.activePlayerIndex, 1); // BB
    assert.strictEqual(state.pot, 40);

    // BB Checks
    state = handleAction(state, { playerId: 'player2', type: 'CHECK' });
    
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
    let state = game.initializeGame([{ id: 'player1', name: 'Alice' }, { id: 'player2', name: 'Bob' }]);

    // SB Folds
    state = handleAction(state, { playerId: 'player1', type: 'FOLD' });
    assert.strictEqual(state.stage, 'SHOWDOWN');
    assert.strictEqual(state.winnerId, 'player2');
  });

  it('should handle 3 players and correct preflop turn order', () => {
    const game = new PokerGame(1000, 10, 20);
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' }
    ];
    let state = game.initializeGame(players);

    assert.strictEqual(state.players.length, 3);
    assert.strictEqual(state.players[1].currentBet, 10); // SB
    assert.strictEqual(state.players[2].currentBet, 20); // BB
    
    // Preflop: UTG acts first. For 3 players, D is UTG.
    assert.strictEqual(state.activePlayerIndex, 0); 

    // Alice Calls
    state = handleAction(state, { playerId: 'p1', type: 'CALL' });
    assert.strictEqual(state.activePlayerIndex, 1); // Bob
    
    // Bob Calls
    state = handleAction(state, { playerId: 'p2', type: 'CALL' });
    assert.strictEqual(state.activePlayerIndex, 2); // Charlie
    
    // Charlie Checks
    state = handleAction(state, { playerId: 'p3', type: 'CHECK' });
    assert.strictEqual(state.activePlayerIndex, -1);
  });

  it('should correctly rotate turns and skip all-in players', () => {
    const game = new PokerGame(1000, 10, 20);
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' }
    ];
    let state = game.initializeGame(players);

    // Preflop: UTG (p1) acts first
    // UTG goes all-in (1000)
    state = handleAction(state, { playerId: 'p1', type: 'RAISE', amount: 1000 });
    assert.strictEqual(state.activePlayerIndex, 1); // SB (p2)
    
    // SB calls all-in (1000)
    state = handleAction(state, { playerId: 'p2', type: 'CALL' });
    assert.strictEqual(state.activePlayerIndex, 2); // BB (p3)
    
    // BB folds
    state = handleAction(state, { playerId: 'p3', type: 'FOLD' });
    
    // Hand is over? No, 2 players left (p1, p2) but they are all-in.
    // wait, handleAction check:
    // nonFoldedPlayers.length === 2.
    // getNextToAct:
    // checks p1 (0). stack is 0. Skip.
    // checks p2 (1). stack is 0. Skip.
    // checks p3 (2). isFolded is true. Skip.
    // returns -1.
    assert.strictEqual(state.activePlayerIndex, -1);
  });
});
