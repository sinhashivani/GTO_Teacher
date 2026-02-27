import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Card } from '../card';
import { handleAction } from '../betting';
import { settlePot } from '../settlement';
import { Player, GameState } from '../types';

describe('Bankroll and Chip Flow', () => {
  const createPlayer = (id: string, stack: number): Player => ({
    id,
    name: id,
    stack,
    holeCards: [],
    currentBet: 0,
    hasActed: false,
    isFolded: false,
  });

  it('Chip Flow: Bet should subtract from stack and add to pot', () => {
    let state: GameState = {
      stage: 'FLOP',
      pot: 0,
      players: [createPlayer('p1', 1000), createPlayer('p2', 1000)],
      activePlayerIndex: 0,
      dealerIndex: 1,
      lastRaiseAmount: 0,
    };

    // p1 bets 100
    state = handleAction(state, { playerId: 'p1', type: 'RAISE', amount: 100 });
    assert.strictEqual(state.players[0].stack, 900);
    assert.strictEqual(state.pot, 100);

    // p2 calls 100
    state.activePlayerIndex = 1;
    state = handleAction(state, { playerId: 'p2', type: 'CALL' });
    assert.strictEqual(state.players[1].stack, 900);
    assert.strictEqual(state.pot, 200);
  });

  it('Settlement: Winner should receive entire pot', () => {
    const players = [createPlayer('p1', 900), createPlayer('p2', 900)];
    players[0].holeCards = [Card.fromString('As'), Card.fromString('Ah')]; // Pair
    players[1].holeCards = [Card.fromString('2s'), Card.fromString('3h')]; // High Card
    
    const board = [Card.fromString('Kd'), Card.fromString('Qd'), Card.fromString('Jh'), Card.fromString('7s'), Card.fromString('5c')];
    const pot = 200;

    const settlement = settlePot(players, board, pot, 1);
    
    assert.strictEqual(settlement.winners.length, 1);
    assert.strictEqual(settlement.winners[0], 'p1');
    assert.strictEqual(settlement.payouts['p1'], 200);
    assert.strictEqual(settlement.payouts['p2'] || 0, 0);
  });
});
