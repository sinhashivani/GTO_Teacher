import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card } from '../card';
import { evaluate7, determineWinners } from '../evaluator';
import { Player } from '../types';

describe('Poker Regression Tests', () => {
  const createPlayer = (id: string, name: string, holeCards: string[]): Player => ({
    id,
    name,
    stack: 1000,
    holeCards: holeCards.map(c => Card.fromString(c)),
    currentBet: 0,
    hasActed: false,
    isFolded: false,
  });

  it('Scenario QQ vs 22 on K-2-J-9-6 (Opponent should win with Trips)', () => {
    // Board: Kc, 2h, Js, 9h, 6d
    const board = ['Kc', '2h', 'Js', '9h', '6d'].map(c => Card.fromString(c));
    
    // Hero: Qd, Qs
    const hero = createPlayer('p1', 'Hero', ['Qd', 'Qs']);
    // Opponent: 2d, 2c
    const opponent = createPlayer('bot', 'Bot', ['2d', '2c']);

    const { winners, evaluationsByPlayerId } = determineWinners([hero, opponent], board);

    assert.strictEqual(winners.length, 1);
    assert.strictEqual(winners[0], 'bot');
    assert.strictEqual(evaluationsByPlayerId['bot'].handClass, 'Three of a Kind');
    assert.strictEqual(evaluationsByPlayerId['p1'].handClass, 'Pair');
  });

  it('High Card Kicker Comparison: AKQJ9 vs AKQJ8', () => {
    const board = ['Ks', 'Qd', 'Jh', '2c', '3s'].map(c => Card.fromString(c));
    const p1 = createPlayer('p1', 'P1', ['As', '9d']);
    const p2 = createPlayer('p2', 'P2', ['Ah', '8c']);

    const { winners } = determineWinners([p1, p2], board);
    assert.strictEqual(winners.length, 1);
    assert.strictEqual(winners[0], 'p1');
  });

  it('Two Pair Comparison: AA KK Q vs AA KK J', () => {
    const board = ['As', 'Ah', 'Ks', 'Kh', '2c'].map(c => Card.fromString(c));
    const p1 = createPlayer('p1', 'P1', ['Qd', '3s']);
    const p2 = createPlayer('p2', 'P2', ['Jd', '4s']);

    const { winners } = determineWinners([p1, p2], board);
    assert.strictEqual(winners.length, 1);
    assert.strictEqual(winners[0], 'p1');
  });

  it('Exact Tie: AKQJ2 vs AKQJ2 (Split Pot)', () => {
    const board = ['As', 'Ks', 'Qs', 'Js', '3s'].map(c => Card.fromString(c));
    const p1 = createPlayer('p1', 'P1', ['2d', '4d']);
    const p2 = createPlayer('p2', 'P2', ['2h', '5h']);

    const { winners } = determineWinners([p1, p2], board);
    assert.strictEqual(winners.length, 2);
  });

  it('Scenario Pair of Q vs High Card Ace (Hero should win)', () => {
    // Board: Qc, Ks, 9d, 7h, Ac
    const board = ['Qc', 'Ks', '9d', '7h', 'Ac'].map(c => Card.fromString(c));
    // Hero: 2s, Qh -> Pair of Queens
    const hero = createPlayer('p1', 'Hero', ['2s', 'Qh']);
    // Opponent: 2h, 5d -> High Card Ace
    const opponent = createPlayer('bot', 'Bot', ['2h', '5d']);

    const { winners } = determineWinners([hero, opponent], board);
    assert.strictEqual(winners.length, 1);
    assert.strictEqual(winners[0], 'p1');
  });
});
