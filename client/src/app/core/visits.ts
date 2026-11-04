import { toIsoDate } from './renewals';

/** localStorage key for the last time Occurra was opened on this device. Never sent anywhere. */
export const LAST_OPENED_KEY = 'occurra.lastOpened';

/** The previous open, read once per app load before it is overwritten. undefined = not read yet. */
let previous: Date | null | undefined;

/**
 * Records this app load as "last opened" and remembers the one before it.
 * Safe to call repeatedly: only the first call per load reads and writes.
 * Browser only; quietly does nothing if storage is unavailable.
 */
export function recordOpen(now = new Date()): void {
  if (previous !== undefined || typeof localStorage === 'undefined') return;
  try {
    const stored = localStorage.getItem(LAST_OPENED_KEY);
    const parsed = stored ? new Date(stored) : null;
    previous = parsed && !isNaN(parsed.getTime()) ? parsed : null;
    localStorage.setItem(LAST_OPENED_KEY, now.toISOString());
  } catch {
    previous = null;
  }
}

/** When Occurra was opened before this visit, or null on the first visit. */
export function previousOpen(): Date | null {
  recordOpen();
  return previous ?? null;
}

export type LastOpened = { when: 'today' | 'yesterday' } | { when: 'date'; date: Date };

/** How to phrase the previous open relative to today (local calendar days). */
export function describeLastOpened(last: Date | null, today: Date): LastOpened | null {
  if (!last) return null;
  const lastDay = toIsoDate(last);
  if (lastDay === toIsoDate(today)) return { when: 'today' };
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (lastDay === toIsoDate(yesterday)) return { when: 'yesterday' };
  return { when: 'date', date: last };
}

/** "1 voucher", "3 vouchers". */
export function countOf(n: number, singular: string, plural = singular + 's'): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Test helper: forget the remembered previous open. */
export function resetRecordedOpen(): void {
  previous = undefined;
}
