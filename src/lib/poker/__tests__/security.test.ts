import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PokerGame } from '../state-machine';
import { Card } from '../card';
import { GameState, Player } from '../types';

describe('Security Leak Prevention', () => {
  const createPlayer = (id: string, holeCards: Card[]): Player => ({
    id,
    name: id,
    stack: 1000,
    holeCards,
    currentBet: 0,
    totalBet: 0,
    hasActed: false,
    isFolded: false,
  });

  const h1 = [new Card('A', 's'), new Card('K', 's')];
  const h2 = [new Card('2', 'h'), new Card('7', 'd')];

  const state: GameState = {
    stage: 'FLOP',
    pot: 0,
    communityCards: [new Card('J', 'h'), new Card('T', 's'), new Card('2', 'c')],
    players: [createPlayer('p1', h1), createPlayer('bot-1', h2)],
    activePlayerIndex: 0,
    dealerIndex: 1,
    lastRaiseAmount: 0,
  };

  it('should mask opponent cards for Hero (p1) before showdown', () => {
    const publicState = PokerGame.getPublicState(state, 'p1');
    assert.deepStrictEqual(publicState.players[0].holeCards, h1);
    assert.strictEqual(publicState.players[1].holeCards.length, 0);
  });

  it('should mask hero cards for Bot-1 view before showdown', () => {
    const publicState = PokerGame.getPublicState(state, 'bot-1');
    assert.deepStrictEqual(publicState.players[1].holeCards, h2);
    assert.strictEqual(publicState.players[0].holeCards.length, 0);
  });

  it('should show ALL cards during SHOWDOWN', () => {
    const showdownState: GameState = { ...state, stage: 'SHOWDOWN' };
    const publicState = PokerGame.getPublicState(showdownState, 'p1');
    assert.deepStrictEqual(publicState.players[0].holeCards, h1);
    assert.deepStrictEqual(publicState.players[1].holeCards, h2);
  });
});
