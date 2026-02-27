import { Player, Card } from './types';
import { determineWinners } from './evaluator';

export interface SettlementResult {
  payouts: Record<string, number>; // playerId -> amount
  winners: string[];
}

/**
 * Settles the pot(s) among players.
 * For now, handles a single main pot. 
 * Award remainder to earliest seat left of dealer.
 */
export function settlePot(
  players: Player[],
  board: Card[],
  pot: number,
  dealerIndex: number
): SettlementResult {
  const nonFolded = players.filter(p => !p.isFolded);
  
  // If only one left, they win everything
  if (nonFolded.length === 1) {
    return {
      payouts: { [nonFolded[0].id]: pot },
      winners: [nonFolded[0].id]
    };
  }

  // Showdown
  const { winners } = determineWinners(players, board);
  const numWinners = winners.length;
  
  if (numWinners === 0) return { payouts: {}, winners: [] };

  const winAmount = Math.floor(pot / numWinners);
  let remainder = pot % numWinners;
  
  const payouts: Record<string, number> = {};
  
  // Base payout
  for (const winnerId of winners) {
    payouts[winnerId] = winAmount;
  }

  // Distribute remainder chips
  // Rule: earliest seat left of dealer
  if (remainder > 0) {
    const numPlayers = players.length;
    for (let i = 1; i <= numPlayers; i++) {
      const seatIndex = (dealerIndex + i) % numPlayers;
      const p = players[seatIndex];
      if (winners.includes(p.id)) {
        payouts[p.id] += 1;
        remainder -= 1;
        if (remainder === 0) break;
      }
    }
  }

  return { payouts, winners };
}
