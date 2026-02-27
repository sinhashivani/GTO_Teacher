import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card } from '../card';
import { evaluateHand, evaluate7 } from '../evaluator';

describe('Hand Evaluation', () => {
  it('should correctly identify a One Pair of Aces', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    const communityCards = [
      Card.fromString('2s'),
      Card.fromString('Js'),
      Card.fromString('4c'),
      Card.fromString('9h'),
      Card.fromString('7s')
    ];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.handClass, 'Pair');
    assert.match(result.description, /Pair of Aces/);
  });

  it('should correctly identify a Straight', () => {
    const holeCards = [Card.fromString('6h'), Card.fromString('7d')];
    const communityCards = [
      Card.fromString('8s'),
      Card.fromString('9d'),
      Card.fromString('Tc'),
      Card.fromString('2h'),
      Card.fromString('3s')
    ];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.handClass, 'Straight');
  });

  it('should correctly identify a Flush', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Kh')];
    const communityCards = [
      Card.fromString('Qh'),
      Card.fromString('Jh'),
      Card.fromString('2h'),
      Card.fromString('8s'),
      Card.fromString('9d')
    ];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.handClass, 'Flush');
  });

  it('should handle Flop evaluation (3 community cards)', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    const communityCards = [
      Card.fromString('As'),
      Card.fromString('3d'),
      Card.fromString('4c')
    ];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.handClass, 'Three of a Kind');
  });

  it('should handle PREFLOP evaluation (2 cards)', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    const communityCards: Card[] = [];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.handClass, 'Pair');
    assert.strictEqual(result.best5.length, 2);
    assert.match(result.description, /Pair of Aces/);
  });

  it('should handle PREFLOP evaluation (2 cards high card)', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Kd')];
    const communityCards: Card[] = [];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.handClass, 'High Card');
    assert.strictEqual(result.best5.length, 2);
    assert.match(result.description, /High card Ace/);
  });

  // Test Vectors from Spec
  it('should identify Straight Flush vs Four of a Kind', () => {
    const sfCards = [
      Card.fromString('9h'), Card.fromString('Th'), Card.fromString('Jh'), Card.fromString('Qh'), Card.fromString('Kh'),
      Card.fromString('2d'), Card.fromString('3d')
    ];
    const quadCards = [
      Card.fromString('As'), Card.fromString('Ah'), Card.fromString('Ad'), Card.fromString('Ac'), Card.fromString('Ks'),
      Card.fromString('Qd'), Card.fromString('Jc')
    ];
    
    const sfResult = evaluate7(sfCards);
    const quadResult = evaluate7(quadCards);
    
    assert.strictEqual(sfResult.handClass, 'Straight Flush');
    assert.strictEqual(quadResult.handClass, 'Four of a Kind');
    assert.ok(sfResult.classRank > quadResult.classRank);
  });

  it('should handle Full House from two trips (choosing highest)', () => {
    const cards = [
      Card.fromString('As'), Card.fromString('Ah'), Card.fromString('Ad'),
      Card.fromString('Ks'), Card.fromString('Kh'), Card.fromString('Kd'),
      Card.fromString('2c')
    ];
    const result = evaluate7(cards);
    assert.strictEqual(result.handClass, 'Full House');
    assert.strictEqual(result.tiebreak[0], 14); // Aces
    assert.strictEqual(result.tiebreak[1], 13); // Kings
    assert.match(result.description, /Aces full of Kings/);
  });

  it('should handle Three Pairs (choosing top two)', () => {
    const cards = [
      Card.fromString('As'), Card.fromString('Ah'),
      Card.fromString('Ks'), Card.fromString('Kh'),
      Card.fromString('Qs'), Card.fromString('Qh'),
      Card.fromString('2c')
    ];
    const result = evaluate7(cards);
    assert.strictEqual(result.handClass, 'Two Pair');
    assert.strictEqual(result.tiebreak[0], 14); // Aces
    assert.strictEqual(result.tiebreak[1], 13); // Kings
    assert.strictEqual(result.tiebreak[2], 12); // Queen kicker
  });

  it('should correctly identify Wheel Straight (A-2-3-4-5)', () => {
    const cards = [
      Card.fromString('As'), Card.fromString('2h'), Card.fromString('3d'), Card.fromString('4c'), Card.fromString('5s'),
      Card.fromString('Kd'), Card.fromString('Qc')
    ];
    const result = evaluate7(cards);
    assert.strictEqual(result.handClass, 'Straight');
    assert.strictEqual(result.tiebreak[0], 5); // High is 5
    assert.match(result.description, /Straight to 5/);
  });

  it('should handle Board-only tie', () => {
    const p1Hole = [Card.fromString('2h'), Card.fromString('3d')];
    const p2Hole = [Card.fromString('4c'), Card.fromString('5s')];
    const board = [
      Card.fromString('As'), Card.fromString('Ks'), Card.fromString('Qs'), Card.fromString('Js'), Card.fromString('Ts')
    ];
    
    const r1 = evaluate7([...p1Hole, ...board]);
    const r2 = evaluate7([...p2Hole, ...board]);
    
    assert.strictEqual(r1.handClass, 'Royal Flush');
    assert.strictEqual(r2.handClass, 'Royal Flush');
    assert.deepStrictEqual(r1.handValue, r2.handValue);
  });

  it('should correctly compare Two Pair kickers', () => {
    const h1 = [Card.fromString('As'), Card.fromString('Ah'), Card.fromString('Ks'), Card.fromString('Kh'), Card.fromString('Qd')];
    const h2 = [Card.fromString('Ad'), Card.fromString('Ac'), Card.fromString('Kd'), Card.fromString('Kc'), Card.fromString('Jd')];
    
    // We need 7 cards for evaluate7 or just mock the call to compareHandValues
    const r1 = evaluate7([...h1, Card.fromString('2s'), Card.fromString('3s')]);
    const r2 = evaluate7([...h2, Card.fromString('2h'), Card.fromString('3h')]);
    
    assert.strictEqual(r1.handClass, 'Two Pair');
    assert.strictEqual(r2.handClass, 'Two Pair');
    assert.ok(r1.handValue[3] > r2.handValue[3]); // Q kicker > J kicker
  });

  it('should handle sample hand: board 8S 4S 8C 3S JS, P1 Jd 6d beats P2 3h 5c', () => {
    const board = [
      Card.fromString('8s'), Card.fromString('4s'), Card.fromString('8c'), Card.fromString('3s'), Card.fromString('Js')
    ];
    const p1Hole = [Card.fromString('Jd'), Card.fromString('6d')];
    const p2Hole = [Card.fromString('3h'), Card.fromString('5c')];
    
    const r1 = evaluate7([...p1Hole, ...board]);
    const r2 = evaluate7([...p2Hole, ...board]);
    
    // P1: Two Pair (Jacks and 8s, kicker 6)
    // P2: Two Pair (8s and 3s, kicker J) -> Wait, board has 8, 8, J. 
    // P1: J, J, 8, 8, 6
    // P2: 8, 8, J, 5, 4 (from board) or 8, 8, J, 3, 3? 
    // Let's re-eval:
    // P1: [Jd, Js, 8s, 8c, 6d] -> Two Pair Jacks and 8s
    // P2: [8s, 8c, Js, 5c, 4s] -> One Pair of 8s (wait, no, board is 8s 4s 8c 3s Js)
    // P2: board has 8, 8. hole has 3. board has 3. So P2 has 8, 8, 3, 3, J.
    
    assert.strictEqual(r1.handClass, 'Two Pair');
    assert.strictEqual(r2.handClass, 'Two Pair');
    
    // r1: [3, 11, 8, 6] (Two Pair rank 3, Jack 11, Eight 8, Six 6)
    // r2: [3, 8, 3, 11] (Two Pair rank 3, Eight 8, Three 3, Jack 11)
    
    assert.ok(r1.handValue[1] > r2.handValue[1]); // Jacks > Eights
  });

  it('should correctly compare High Card hands lexicographically', () => {
    // Both have no made hand
    const h1 = [Card.fromString('As'), Card.fromString('Td'), Card.fromString('8s'), Card.fromString('6c'), Card.fromString('4h')];
    const h2 = [Card.fromString('Ah'), Card.fromString('Ts'), Card.fromString('8d'), Card.fromString('6h'), Card.fromString('2s')];
    
    const r1 = evaluate7([...h1, Card.fromString('3s'), Card.fromString('2c')]);
    const r2 = evaluate7([...h2, Card.fromString('3d'), Card.fromString('4c')]);
    
    assert.strictEqual(r1.handClass, 'High Card');
    assert.strictEqual(r2.handClass, 'High Card');
    
    // Compare kickers: A, T, 8, 6, 4 vs A, T, 8, 6, 4 (wait, h2 has 2)
    // h1: [14, 10, 8, 6, 4]
    // h2: [14, 10, 8, 6, 4] -> wait, h2 has [14, 10, 8, 6, 4] too because board has 4c?
    // Let's make it simpler.
    // h1: A K Q J 9
    // h2: A K Q J 8
    const cards1 = [Card.fromString('As'), Card.fromString('Kd'), Card.fromString('Qh'), Card.fromString('Jc'), Card.fromString('9s'), Card.fromString('2h'), Card.fromString('3d')];
    const cards2 = [Card.fromString('Ad'), Card.fromString('Kc'), Card.fromString('Qs'), Card.fromString('Jh'), Card.fromString('8s'), Card.fromString('2c'), Card.fromString('3h')];
    
    const res1 = evaluate7(cards1);
    const res2 = evaluate7(cards2);
    
    assert.ok(res1.handValue[5] > res2.handValue[5]); // 9 > 8
  });

  it('should identify a tie with identical High Card hands', () => {
    const cards1 = [Card.fromString('As'), Card.fromString('Kd'), Card.fromString('Qh'), Card.fromString('Jc'), Card.fromString('9s'), Card.fromString('2h'), Card.fromString('3d')];
    const cards2 = [Card.fromString('Ad'), Card.fromString('Kc'), Card.fromString('Qs'), Card.fromString('Jh'), Card.fromString('9h'), Card.fromString('2c'), Card.fromString('3h')];
    
    const res1 = evaluate7(cards1);
    const res2 = evaluate7(cards2);
    
    assert.strictEqual(res1.handClass, 'High Card');
    assert.strictEqual(res2.handClass, 'High Card');
    assert.deepStrictEqual(res1.handValue, res2.handValue);
  });

  it('Pair of 2s should beat High Card Ace', () => {
    const pair2s = [Card.fromString('2s'), Card.fromString('2h'), Card.fromString('3d'), Card.fromString('4c'), Card.fromString('5s'), Card.fromString('7h'), Card.fromString('8d')];
    const highCardA = [Card.fromString('As'), Card.fromString('Kd'), Card.fromString('Qh'), Card.fromString('Jc'), Card.fromString('9s'), Card.fromString('8h'), Card.fromString('7d')];
    
    const res1 = evaluate7(pair2s);
    const res2 = evaluate7(highCardA);
    
    assert.strictEqual(res1.handClass, 'Pair');
    assert.strictEqual(res2.handClass, 'High Card');
    assert.ok(res1.handValue[0] > res2.handValue[0]); // 2 > 1
  });
});
