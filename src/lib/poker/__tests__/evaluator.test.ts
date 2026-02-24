import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card } from '../card';
import { evaluateHand } from '../evaluator';

describe('Hand Evaluation', () => {
  it('should correctly identify a Pair of Aces', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    const communityCards = [
      Card.fromString('2s'),
      Card.fromString('Js'),
      Card.fromString('4c'),
      Card.fromString('9h'),
      Card.fromString('7s')
    ];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.category, 'Pair');
    assert.match(result.name, /Pair/);
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
    assert.strictEqual(result.category, 'Straight');
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
    assert.strictEqual(result.category, 'Flush');
  });

  it('should handle Flop evaluation (3 community cards)', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    const communityCards = [
      Card.fromString('As'),
      Card.fromString('3d'),
      Card.fromString('4c')
    ];
    const result = evaluateHand(holeCards, communityCards);
    assert.strictEqual(result.category, 'Three of a Kind');
  });
});
