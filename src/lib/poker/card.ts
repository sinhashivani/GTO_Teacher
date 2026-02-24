import { Card as ICard, Rank, Suit } from './types';

export class Card implements ICard {
  constructor(public readonly rank: Rank, public readonly suit: Suit) {}

  toString(): string {
    return `${this.rank}${this.suit}`;
  }

  static fromString(cardStr: string): Card {
    if (cardStr.length !== 2) {
      throw new Error(`Invalid card string: ${cardStr}`);
    }
    const rank = cardStr[0] as Rank;
    const suit = cardStr[1] as Suit;
    return new Card(rank, suit);
  }
}
