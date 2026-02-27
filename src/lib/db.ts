import Dexie, { type Table } from 'dexie';
import { GameState } from './poker/types';

export interface UserSettings {
  id?: number;
  feedbackTiming: 'immediate' | 'delayed';
  showHandHistory: boolean;
  difficulty: 'easy' | 'medium' | 'expert' | 'mixed';
  playerCount: number;
  playerName: string;
  gameSpeed: 'normal' | 'fast';
  showHandGuide: boolean;
  showPositionLabels: boolean;
  creditMode: boolean;
  creditLimit: number;
  startingStack: number;
}

export interface HandHistory {
  id?: number;
  timestamp: number;
  finalState: GameState;
  won: boolean;
  profit: number;
  accuracyScore: number;
  evDelta?: number; // Average EV loss for this hand
  leaks?: string[]; // Identified leaks in this hand
  reason?: string; // e.g., 'left game'
}

export class GTODatabase extends Dexie {
  settings!: Table<UserSettings>;
  hands!: Table<HandHistory>;

  constructor() {
    super('GTOTeacherDB');
    this.version(7).stores({
      settings: '++id',
      hands: '++id, timestamp, won'
    });
  }
}

export const db = new GTODatabase();

// Initialize default settings if not exists
export async function ensureSettings() {
  const count = await db.settings.count();
  if (count === 0) {
    await db.settings.add({
      feedbackTiming: 'immediate',
      showHandHistory: true,
      difficulty: 'medium',
      playerCount: 2,
      playerName: 'You',
      gameSpeed: 'normal',
      showHandGuide: false,
      showPositionLabels: true,
      creditMode: false,
      creditLimit: -2000,
      startingStack: 1000
    });
  }
}
