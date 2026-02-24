import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Deck } from '../deck';

describe('Deck', () => {
  it('should initialize with 52 cards', () => {
    const deck = new Deck();
    assert.strictEqual(deck.remainingCount, 52);
  });

  it('should draw the correct number of cards', () => {
    const deck = new Deck();
    const drawn = deck.draw(5);
    assert.strictEqual(drawn.length, 5);
    assert.strictEqual(deck.remainingCount, 47);
  });

  it('should draw unique cards', () => {
    const deck = new Deck();
    const drawn = deck.draw(52);
    const uniqueCards = new Set(drawn.map(c => c.toString()));
    assert.strictEqual(uniqueCards.size, 52);
  });

  it('should shuffle the deck', () => {
    const deck1 = new Deck();
    const deck2 = new Deck();
    deck2.shuffle();
    
    const cards1 = deck1.draw(52).map(c => c.toString());
    const cards2 = deck2.draw(52).map(c => c.toString());
    
    // While it's theoretically possible for them to be identical after a shuffle,
    // the probability is virtually zero (1/52!).
    assert.notDeepStrictEqual(cards1, cards2);
  });
});
