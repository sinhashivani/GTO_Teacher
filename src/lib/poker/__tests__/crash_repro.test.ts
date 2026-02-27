import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card } from '../card';
import { evaluateHand } from '../evaluator';

describe('Hand Evaluation Crash Repro', () => {
  it('should not crash on Preflop (2 cards)', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    const communityCards: any[] = [];
    try {
      const result = evaluateHand(holeCards, communityCards);
      assert.strictEqual(result.handClass, 'One Pair');
    } catch (e: any) {
      assert.fail(`Should not have thrown: ${e.message}`);
    }
  });

  it('should not crash on 4 cards', () => {
    const holeCards = [Card.fromString('Ah'), Card.fromString('Ad')];
    const communityCards = [
      Card.fromString('As'),
      Card.fromString('3d')
    ];
    try {
      const result = evaluateHand(holeCards, communityCards);
      assert.strictEqual(result.handClass, 'Three of a Kind');
    } catch (e: any) {
      assert.fail(`Should not have thrown: ${e.message}`);
    }
  });
});
