import { Subscription } from '../core/db';

export interface WeeklyAwareness {
  count: number;
  upcoming: Subscription[];
  monthlyTotal: number;
}

/** Local calendar date as YYYY-MM-DD, matching how nextRenewal is stored. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Renewals from today through the next 7 days, plus a monthly-equivalent total. */
export function weeklyAwareness(subscriptions: Subscription[], today: Date): WeeklyAwareness {
  const start = toIsoDate(today);
  const end = toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));

  return {
    count: subscriptions.length,
    upcoming: subscriptions
      .filter((s) => s.nextRenewal >= start && s.nextRenewal <= end)
      .sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal)),
    monthlyTotal: subscriptions.reduce(
      (sum, s) => sum + (s.cycle === 'monthly' ? s.amount : s.amount / 12),
      0,
    ),
  };
}
