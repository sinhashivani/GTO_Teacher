import Dexie, { type Table } from 'dexie';
import { GameState } from './poker/types';

export interface UserSettings {
  id?: number;
  feedbackTiming: 'immediate' | 'delayed';
  showHandHistory: boolean;
  difficulty: 'easy' | 'medium' | 'expert';
  playerName: string;
}

export interface HandHistory {
  id?: number;
  timestamp: number;
  finalState: GameState;
  won: boolean;
  profit: number;
  accuracyScore: number; // 100 for correct, 0 for incorrect (simplified for now)
}

export class GTODatabase extends Dexie {
  settings!: Table<UserSettings>;
  hands!: Table<HandHistory>;

  constructor() {
    super('GTOTeacherDB');
    this.version(2).stores({
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
      playerName: 'You'
    });
  }
}
