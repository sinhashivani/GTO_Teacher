import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card } from '../card';
import { handleAction } from '../betting';
import { determineWinners, evaluate7 } from '../evaluator';
import { Player, GameState } from '../types';

describe('Quick Refinement Logic Tests', () => {
  const createPlayer = (id: string, stack: number): Player => ({
    id,
    name: id,
    stack,
    holeCards: [],
    currentBet: 0,
    hasActed: false,
    isFolded: false,
    isAllIn: false,
  });

  it('All-in Call Accounting: Hero calls more than remaining stack', () => {
    let state: GameState = {
      stage: 'FLOP',
      pot: 0,
      players: [
        createPlayer('bot', 1000), 
        createPlayer('p1', 300)
      ],
      activePlayerIndex: 0,
      dealerIndex: 1,
      lastRaiseAmount: 0,
    };

    // Bot goes all in for 1000
    state = handleAction(state, { playerId: 'bot', type: 'RAISE', amount: 1000 });
    assert.strictEqual(state.players[0].stack, 0);
    assert.strictEqual(state.players[0].isAllIn, true);
    assert.strictEqual(state.pot, 1000);

    // Hero calls with only 300
    state.activePlayerIndex = 1;
    state = handleAction(state, { playerId: 'p1', type: 'CALL' });
    
    assert.strictEqual(state.players[1].stack, 0, 'Hero stack should be 0');
    assert.strictEqual(state.players[1].isAllIn, true, 'Hero should be marked all-in');
    assert.strictEqual(state.pot, 1300, 'Pot should be bot bet + hero call');
    assert.strictEqual(state.players[1].currentBet, 300, 'Hero current bet should be capped at 300');
  });

  it('All-in Call Accounting: Hero calls with enough stack', () => {
    let state: GameState = {
      stage: 'FLOP',
      pot: 0,
      players: [
        createPlayer('bot', 500), 
        createPlayer('p1', 1000)
      ],
      activePlayerIndex: 0,
      dealerIndex: 1,
      lastRaiseAmount: 0,
    };

    // Bot goes all in for 500
    state = handleAction(state, { playerId: 'bot', type: 'RAISE', amount: 500 });
    assert.strictEqual(state.players[0].stack, 0);
    assert.strictEqual(state.pot, 500);

    // Hero calls 500
    state.activePlayerIndex = 1;
    state = handleAction(state, { playerId: 'p1', type: 'CALL' });
    
    assert.strictEqual(state.players[1].stack, 500, 'Hero stack should be 1000 - 500');
    assert.strictEqual(state.pot, 1000, 'Pot should be 1000');
    assert.strictEqual(state.players[1].currentBet, 500);
  });

  it('Showdown Labeling: Board-only High Card outcome', () => {
    // Board: Ace, King, Queen, Jack, 9
    const board = ['As', 'Kd', 'Qh', 'Jc', '9s'].map(c => Card.fromString(c));
    // Players have lower cards
    const p1Cards = ['2s', '3d'].map(c => Card.fromString(c));
    const p2Cards = ['4h', '5c'].map(c => Card.fromString(c));

    const result1 = evaluate7([...p1Cards, ...board]);
    const result2 = evaluate7([...p2Cards, ...board]);

    assert.strictEqual(result1.handClass, 'High Card');
    assert.strictEqual(result1.description, 'Ace High Card');
    assert.strictEqual(result1.highlightCards[0].rank, 'A');
    
    const { winners } = determineWinners([
      { ...createPlayer('p1', 1000), holeCards: p1Cards },
      { ...createPlayer('p2', 1000), holeCards: p2Cards }
    ], board);

    assert.strictEqual(winners.length, 2, 'Should be a split pot if board is best');
  });
});
