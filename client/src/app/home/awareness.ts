import { Expense, Subscription, Voucher } from '../core/db';
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

/** Days back (including today) that count as "this week" for expenses. */
export const EXPENSE_WINDOW_DAYS = 7;
/** Days ahead that count as "soon" for a voucher's expiry: two weeks leaves time to use it. */
export const VOUCHER_WINDOW_DAYS = 14;

export interface RecentExpenses {
  count: number;
  total: number;
}

/** Expenses dated within the past 7 days, today included. Future-dated ones aren't counted. */
export function recentExpenses(expenses: Expense[], today: Date): RecentExpenses {
  const start = toIsoDate(addDays(today, -(EXPENSE_WINDOW_DAYS - 1)));
  const end = toIsoDate(today);
  const recent = expenses.filter((e) => e.date >= start && e.date <= end);
  return { count: recent.length, total: recent.reduce((sum, e) => sum + e.amount, 0) };
}

/** Vouchers expiring from today through the next 14 days, soonest first. Expired ones are left out. */
export function vouchersExpiringSoon(vouchers: Voucher[], today: Date): Voucher[] {
  const start = toIsoDate(today);
  const end = toIsoDate(addDays(today, VOUCHER_WINDOW_DAYS));
  return vouchers
    .filter((v) => !!v.expiry && v.expiry >= start && v.expiry <= end)
    .sort((a, b) => a.expiry!.localeCompare(b.expiry!));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
