import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card } from '../card';
import { settlePot } from '../settlement';
import { Player } from '../types';

describe('Pot Settlement', () => {
  const createPlayer = (id: string, name: string, stack: number): Player => ({
    id,
    name,
    stack,
    holeCards: [],
    currentBet: 0,
    hasActed: false,
    isFolded: false,
  });

  it('should award full pot to a single winner (no fold)', () => {
    const players = [
      createPlayer('p1', 'Alice', 1000),
      createPlayer('p2', 'Bob', 1000),
    ];
    // Alice has AA, Bob has 22
    players[0].holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    players[1].holeCards = [Card.fromString('2h'), Card.fromString('2d')];
    
    const board = [
      Card.fromString('Kh'), Card.fromString('Qh'), Card.fromString('Jh'), Card.fromString('Th'), Card.fromString('9h')
    ];
    
    const result = settlePot(players, board, 100, 0);
    assert.strictEqual(result.payouts['p1'], 100);
    assert.strictEqual(result.winners[0], 'p1');
  });

  it('should split pot evenly between two winners', () => {
    const players = [
      createPlayer('p1', 'Alice', 1000),
      createPlayer('p2', 'Bob', 1000),
    ];
    // Both have Royal Flush on board
    const board = [
      Card.fromString('As'), Card.fromString('Ks'), Card.fromString('Qs'), Card.fromString('Js'), Card.fromString('Ts')
    ];
    
    const result = settlePot(players, board, 100, 0);
    assert.strictEqual(result.payouts['p1'], 50);
    assert.strictEqual(result.payouts['p2'], 50);
    assert.strictEqual(result.winners.length, 2);
  });

  it('should award remainder chip to the earliest seat left of dealer', () => {
    const players = [
      createPlayer('p0', 'Alice', 1000), // Dealer
      createPlayer('p1', 'Bob', 1000),   // SB
      createPlayer('p2', 'Charlie', 1000) // BB
    ];
    // All tie
    const board = [
      Card.fromString('As'), Card.fromString('Ks'), Card.fromString('Qs'), Card.fromString('Js'), Card.fromString('Ts')
    ];
    
    // Pot 100 / 3 winners = 33 each, 1 remainder.
    // Dealer is p0 (index 0). 
    // Earliest seat left of dealer is index 1 (p1).
    const result = settlePot(players, board, 100, 0);
    assert.strictEqual(result.payouts['p1'], 34);
    assert.strictEqual(result.payouts['p0'], 33);
    assert.strictEqual(result.payouts['p2'], 33);
  });

  it('should handle remainder chip with dealer at the end of the array', () => {
    const players = [
      createPlayer('p0', 'Alice', 1000), 
      createPlayer('p1', 'Bob', 1000),   
      createPlayer('p2', 'Charlie', 1000) // Dealer
    ];
    const board = [
      Card.fromString('As'), Card.fromString('Ks'), Card.fromString('Qs'), Card.fromString('Js'), Card.fromString('Ts')
    ];
    
    // Pot 100, 3 winners. Remainder 1.
    // Dealer is p2 (index 2).
    // Earliest seat left of dealer is index 0 (p0).
    const result = settlePot(players, board, 100, 2);
    assert.strictEqual(result.payouts['p0'], 34);
    assert.strictEqual(result.payouts['p1'], 33);
    assert.strictEqual(result.payouts['p2'], 33);
  });
});
