import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSidePots } from '../betting';
import { Player } from '../types';

describe('Betting Logic', () => {
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
