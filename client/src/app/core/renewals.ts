import { Subscription, db } from './db';

/** Local calendar date as YYYY-MM-DD, matching how nextRenewal is stored. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Adds whole months, holding the day where it fits and using the month's last day where it doesn't. */
function addMonths(year: number, monthIndex: number, day: number, months: number): Date {
  const lastDay = new Date(year, monthIndex + months + 1, 0).getDate();
  return new Date(year, monthIndex + months, Math.min(day, lastDay));
}

/**
 * Moves a past renewal date forward by whole cycles until it is today or later.
 * Dates already today or in the future come back unchanged.
 */
export function advanceRenewal(nextRenewal: string, cycle: Subscription['cycle'], today: Date): string {
  const todayIso = toIsoDate(today);
  if (nextRenewal >= todayIso) return nextRenewal;

  const [y, m, d] = nextRenewal.split('-').map(Number);
  const step = cycle === 'monthly' ? 1 : 12;
  // Count from the stored date each time so a 31st doesn't drift to the 28th within one advance.
  for (let months = step; ; months += step) {
    const candidate = toIsoDate(addMonths(y, m - 1, d, months));
    if (candidate >= todayIso) return candidate;
  }
}

/**
 * Loads every subscription ordered by next renewal, quietly advancing past dates
 * and saving them first. Browser only: call from afterNextRender.
 */
export async function loadSubscriptions(today = new Date()): Promise<Subscription[]> {
  const subscriptions = await db.subscriptions.toArray();
  const advanced = subscriptions.filter((s) => {
    const next = advanceRenewal(s.nextRenewal, s.cycle, today);
    if (next === s.nextRenewal) return false;
    s.nextRenewal = next;
    return true;
  });

  if (advanced.length) {
    await db.transaction('rw', db.subscriptions, () =>
      Promise.all(advanced.map((s) => db.subscriptions.update(s.id!, { nextRenewal: s.nextRenewal }))),
    );
  }

  return subscriptions.sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal));
}
