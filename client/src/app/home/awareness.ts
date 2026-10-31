import { Subscription } from '../core/db';
import { toIsoDate } from '../core/renewals';

export { toIsoDate };

export interface WeeklyAwareness {
  count: number;
  upcoming: Subscription[];
  monthlyTotal: number;
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
    monthlyTotal: monthlyTotal(subscriptions),
  };
}

/** Monthly-equivalent total: yearly amounts are spread across 12 months. */
export function monthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce(
    (sum, s) => sum + (s.cycle === 'monthly' ? s.amount : s.amount / 12),
    0,
  );
}
