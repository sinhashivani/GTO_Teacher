// @ts-ignore
import { Hand } from 'pokersolver';
import { Card } from './card';
import { HandResult, HandCategory } from './types';

const CATEGORY_MAP: Record<string, HandCategory> = {
  'High Card': 'High Card',
  'Pair': 'Pair',
  'Two Pair': 'Two Pair',
  'Three of a Kind': 'Three of a Kind',
  'Straight': 'Straight',
  'Flush': 'Flush',
  'Full House': 'Full House',
  'Four of a Kind': 'Four of a Kind',
  'Straight Flush': 'Straight Flush',
  'Royal Flush': 'Royal Flush',
};

export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandResult {
  const cards = [...holeCards, ...communityCards].map(c => {
    // pokersolver expects 10 for Ten, but we use T. 
    // It actually supports T, J, Q, K, A.
    return c.toString();
  });
  
  const solved = Hand.solve(cards);

  return {
    score: solved.rank, // Higher is better
    category: CATEGORY_MAP[solved.name] || 'High Card',
    name: solved.descr,
  };
}
