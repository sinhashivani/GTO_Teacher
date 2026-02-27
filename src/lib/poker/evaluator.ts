import { Card, Rank, Suit, HandResult, HandCategory, Player } from './types';

const rankToValue: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const valueToRank: Record<number, Rank> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
  10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const valueToName: Record<number, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
  10: '10', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace'
};

const valueToPlural: Record<number, string> = {
  2: '2s', 3: '3s', 4: '4s', 5: '5s', 6: '6s', 7: '7s', 8: '8s', 9: '9s',
  10: '10s', 11: 'Jacks', 12: 'Queens', 13: 'Kings', 14: 'Aces'
};

const CLASS_RANKS: Record<HandCategory, number> = {
  'High Card': 1,
  'Pair': 2,
  'Two Pair': 3,
  'Three of a Kind': 4,
  'Straight': 5,
  'Flush': 6,
  'Full House': 7,
  'Four of a Kind': 8,
  'Straight Flush': 9,
  'Royal Flush': 10,
};

export function evaluate7(cards: Card[]): HandResult {
  // Feature extraction
  const countsByRank = new Map<number, number>();
  const cardsByRank = new Map<number, Card[]>();
  const cardsBySuit = new Map<Suit, Card[]>();

  for (const card of cards) {
    const val = rankToValue[card.rank];
    countsByRank.set(val, (countsByRank.get(val) || 0) + 1);
    
    if (!cardsByRank.has(val)) cardsByRank.set(val, []);
    cardsByRank.get(val)!.push(card);

    if (!cardsBySuit.has(card.suit)) cardsBySuit.set(card.suit, []);
    cardsBySuit.get(card.suit)!.push(card);
  }

  const sortedRanks = Array.from(countsByRank.keys()).sort((a, b) => b - a);
  const quads = sortedRanks.filter(r => countsByRank.get(r) === 4);
  const trips = sortedRanks.filter(r => countsByRank.get(r) === 3);
  const pairs = sortedRanks.filter(r => countsByRank.get(r) === 2);
  const singles = sortedRanks.filter(r => countsByRank.get(r) === 1);

  // Helper to get best kicker
  const getKickers = (excludeRanks: number[], count: number): number[] => {
    return sortedRanks
      .filter(r => !excludeRanks.includes(r))
      .flatMap(r => Array(countsByRank.get(r)).fill(r))
      .slice(0, count);
  };

  const getKickerCards = (excludeRanks: number[], count: number): Card[] => {
    const kickerRanks = getKickers(excludeRanks, count);
    const result: Card[] = [];
    const usedCounts = new Map<number, number>();
    
    for (const r of kickerRanks) {
      const used = usedCounts.get(r) || 0;
      result.push(cardsByRank.get(r)![used]);
      usedCounts.set(r, used + 1);
    }
    return result;
  };

  // 1. Straight Flush
  for (const [suit, suitCards] of cardsBySuit.entries()) {
    if (suitCards.length >= 5) {
      const sRanks = Array.from(new Set(suitCards.map(c => rankToValue[c.rank]))).sort((a, b) => b - a);
      const highStraight = getHighStraight(sRanks);
      if (highStraight) {
        const best5Ranks = highStraight === 5 ? [14, 5, 4, 3, 2] : [highStraight, highStraight-1, highStraight-2, highStraight-3, highStraight-4];
        const best5 = best5Ranks.map(r => suitCards.find(c => rankToValue[c.rank] === r)!);
        
        const isRoyal = highStraight === 14;
        const handClass: HandCategory = isRoyal ? 'Royal Flush' : 'Straight Flush';
        
        return {
          handClass,
          classRank: CLASS_RANKS[handClass],
          best5,
          tiebreak: [highStraight],
          handValue: [CLASS_RANKS[handClass], highStraight],
          description: isRoyal ? 'Royal Flush' : `Straight Flush to ${valueToName[highStraight]}`
        };
      }
    }
  }

  // 2. Four of a Kind
  if (quads.length > 0) {
    const quadRank = quads[0];
    const kickers = getKickers([quadRank], 1);
    const best5 = [...cardsByRank.get(quadRank)!, ...getKickerCards([quadRank], 1)];
    const tiebreak = [quadRank, kickers[0]];
    return {
      handClass: 'Four of a Kind',
      classRank: CLASS_RANKS['Four of a Kind'],
      best5,
      tiebreak,
      handValue: [CLASS_RANKS['Four of a Kind'], ...tiebreak],
      description: `Four of a kind, ${valueToPlural[quadRank]} with ${valueToName[kickers[0]]} kicker`
    };
  }

  // 3. Full House
  if ((trips.length >= 1 && (trips.length > 1 || pairs.length >= 1))) {
    const tripRank = trips[0];
    const pairRank = trips.length > 1 ? trips[1] : pairs[0];
    const best5 = [...cardsByRank.get(tripRank)!, ...cardsByRank.get(pairRank)!.slice(0, 2)];
    const tiebreak = [tripRank, pairRank];
    return {
      handClass: 'Full House',
      classRank: CLASS_RANKS['Full House'],
      best5,
      tiebreak,
      handValue: [CLASS_RANKS['Full House'], ...tiebreak],
      description: `Full house, ${valueToPlural[tripRank]} full of ${valueToPlural[pairRank]}`
    };
  }

  // 4. Flush
  for (const [suit, suitCards] of cardsBySuit.entries()) {
    if (suitCards.length >= 5) {
      const sortedSuitCards = suitCards.sort((a, b) => rankToValue[b.rank] - rankToValue[a.rank]);
      const best5 = sortedSuitCards.slice(0, 5);
      const tiebreak = best5.map(c => rankToValue[c.rank]);
      return {
        handClass: 'Flush',
        classRank: CLASS_RANKS['Flush'],
        best5,
        tiebreak,
        handValue: [CLASS_RANKS['Flush'], ...tiebreak],
        description: `Flush, ${tiebreak.map(v => valueToName[v]).join(', ')} high`
      };
    }
  }

  // 5. Straight
  const highStraight = getHighStraight(sortedRanks);
  if (highStraight) {
    const best5Ranks = highStraight === 5 ? [14, 5, 4, 3, 2] : [highStraight, highStraight-1, highStraight-2, highStraight-3, highStraight-4];
    const best5 = best5Ranks.map(r => cardsByRank.get(r)![0]);
    return {
      handClass: 'Straight',
      classRank: CLASS_RANKS['Straight'],
      best5,
      tiebreak: [highStraight],
      handValue: [CLASS_RANKS['Straight'], highStraight],
      description: `Straight to ${valueToName[highStraight]}`
    };
  }

  // 6. Three of a Kind
  if (trips.length > 0) {
    const tripRank = trips[0];
    const kickers = getKickers([tripRank], 2);
    const best5 = [...cardsByRank.get(tripRank)!, ...getKickerCards([tripRank], 2)];
    const tiebreak = [tripRank, ...kickers];
    return {
      handClass: 'Three of a Kind',
      classRank: CLASS_RANKS['Three of a Kind'],
      best5,
      tiebreak,
      handValue: [CLASS_RANKS['Three of a Kind'], ...tiebreak],
      description: `Three of a kind, ${valueToPlural[tripRank]} with ${kickers.map(v => valueToName[v]).join(' and ')}`
    };
  }

  // 7. Two Pair
  if (pairs.length >= 2) {
    const highPair = pairs[0];
    const lowPair = pairs[1];
    const kickers = getKickers([highPair, lowPair], 1);
    const best5 = [...cardsByRank.get(highPair)!, ...cardsByRank.get(lowPair)!, ...getKickerCards([highPair, lowPair], 1)];
    const tiebreak = [highPair, lowPair, kickers[0]];
    return {
      handClass: 'Two Pair',
      classRank: CLASS_RANKS['Two Pair'],
      best5,
      tiebreak,
      handValue: [CLASS_RANKS['Two Pair'], ...tiebreak],
      description: `Two pair, ${valueToPlural[highPair]} and ${valueToPlural[lowPair]} with ${valueToName[kickers[0]]} kicker`
    };
  }

  // 8. Pair
  if (pairs.length === 1) {
    const pairRank = pairs[0];
    const kickers = getKickers([pairRank], 3);
    const best5 = [...cardsByRank.get(pairRank)!, ...getKickerCards([pairRank], 3)];
    const tiebreak = [pairRank, ...kickers];
    return {
      handClass: 'Pair',
      classRank: CLASS_RANKS['Pair'],
      best5,
      tiebreak,
      handValue: [CLASS_RANKS['Pair'], ...tiebreak],
      description: `Pair of ${valueToPlural[pairRank]} with ${kickers.map(v => valueToName[v]).join(', ')}`
    };
  }

  // 9. High Card
  const kickers = getKickers([], 5);
  const best5 = getKickerCards([], 5);
  return {
    handClass: 'High Card',
    classRank: CLASS_RANKS['High Card'],
    best5,
    tiebreak: kickers,
    handValue: [CLASS_RANKS['High Card'], ...kickers],
    description: `High card ${valueToName[kickers[0]]}, then ${kickers.slice(1).map(v => valueToName[v]).join(', ')}`
  };
}

function getHighStraight(ranks: number[]): number | null {
  const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => b - a);
  if (uniqueRanks.length < 5) return null;

  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      return uniqueRanks[i];
    }
  }

  // Ace-low straight (Wheel)
  if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
    return 5;
  }

  return null;
}

export function determineWinners(players: Player[], board: Card[]) {
  const activePlayers = players.filter(p => !p.isFolded);
  if (activePlayers.length === 0) return { winners: [], evaluationsByPlayerId: {} };

  const evals = activePlayers.map(p => ({
    playerId: p.id,
    evaluation: evaluate7([...p.holeCards, ...board])
  }));

  const evaluationsByPlayerId: Record<string, HandResult> = {};
  evals.forEach(e => {
    evaluationsByPlayerId[e.playerId] = e.evaluation;
  });

  // Sort by handValue lexicographically
  evals.sort((a, b) => {
    const valA = a.evaluation.handValue;
    const valB = b.evaluation.handValue;
    for (let i = 0; i < Math.max(valA.length, valB.length); i++) {
      if ((valA[i] || 0) > (valB[i] || 0)) return -1;
      if ((valA[i] || 0) < (valB[i] || 0)) return 1;
    }
    return 0;
  });

  const bestHandValue = evals[0].evaluation.handValue;
  const winners = evals
    .filter(e => compareHandValues(e.evaluation.handValue, bestHandValue) === 0)
    .map(e => e.playerId);

  return { winners, evaluationsByPlayerId };
}

function compareHandValues(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) > (b[i] || 0)) return 1;
    if ((a[i] || 0) < (b[i] || 0)) return -1;
  }
  return 0;
}

// Wrapper for existing code
export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandResult {
  return evaluate7([...holeCards, ...communityCards]);
}
