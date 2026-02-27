export const BANKROLL_STORAGE_KEY = 'gto_teacher.bankrolls.v1';

export interface BankrollData {
  [playerId: string]: number;
}

export function loadBankrolls(): BankrollData {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(BANKROLL_STORAGE_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load bankrolls', e);
    return {};
  }
}

export function saveBankrolls(bankrolls: BankrollData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BANKROLL_STORAGE_KEY, JSON.stringify(bankrolls));
}

export function saveAllBankrolls(players: { id: string, stack: number }[]): void {
  const current = loadBankrolls();
  players.forEach(p => {
    current[p.id] = p.stack;
  });
  saveBankrolls(current);
}

export function setBankroll(playerId: string, amount: number): void {
  const current = loadBankrolls();
  current[playerId] = amount;
  saveBankrolls(current);
}

export function updateBankroll(playerId: string, amount: number): void {
  const current = loadBankrolls();
  current[playerId] = (current[playerId] || 1000) + amount;
  saveBankrolls(current);
}

export function getBankroll(playerId: string, defaultStack: number = 1000): number {
  const current = loadBankrolls();
  return current[playerId] ?? defaultStack;
}

export function resetHeroBankroll(startingStack: number): void {
  setBankroll('p1', startingStack);
}

export function resetAllBankrolls(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BANKROLL_STORAGE_KEY);
}
