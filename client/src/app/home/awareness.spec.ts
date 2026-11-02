import { Subscription } from '../core/db';
import { recentExpenses, toIsoDate, vouchersExpiringSoon, weeklyAwareness } from './awareness';

const sub = (name: string, nextRenewal: string, amount = 10, cycle: Subscription['cycle'] = 'monthly'): Subscription => ({
  name,
  amount,
  cycle,
  nextRenewal,
});

describe('weeklyAwareness', () => {
  const today = new Date(2026, 9, 29); // 29 Oct 2026, local time

  it('formats local dates as YYYY-MM-DD', () => {
    expect(toIsoDate(today)).toBe('2026-10-29');
  });

  it('includes renewals from today through 7 days ahead, sorted by date', () => {
    const result = weeklyAwareness(
      [
        sub('Past', '2026-10-28'),
        sub('Week end', '2026-11-05'),
        sub('Today', '2026-10-29'),
        sub('Too far', '2026-11-06'),
      ],
      today,
    );
    expect(result.upcoming.map((s) => s.name)).toEqual(['Today', 'Week end']);
    expect(result.count).toBe(4);
  });

  it('spreads yearly amounts across 12 months in the monthly total', () => {
    const result = weeklyAwareness([sub('Music', '2027-01-01', 5), sub('Storage', '2027-03-01', 24, 'yearly')], today);
    expect(result.monthlyTotal).toBe(7);
  });

  it('is quiet with no subscriptions', () => {
    expect(weeklyAwareness([], today)).toEqual({ count: 0, upcoming: [], monthlyTotal: 0 });
  });
});

describe('recentExpenses', () => {
  const today = new Date(2026, 10, 2); // 2 Nov 2026
  const e = (date: string, amount: number) => ({ name: 'x', amount, date });

  it('counts today and the six days before it', () => {
    const result = recentExpenses([e('2026-11-02', 4.5), e('2026-10-27', 10), e('2026-10-26', 99), e('2026-11-03', 50)], today);
    expect(result).toEqual({ count: 2, total: 14.5 });
  });

  it('is empty with no expenses in the window', () => {
    expect(recentExpenses([e('2026-10-01', 5)], today)).toEqual({ count: 0, total: 0 });
  });
});

describe('vouchersExpiringSoon', () => {
  const today = new Date(2026, 10, 2); // 2 Nov 2026
  const v = (name: string, expiry?: string) => ({ name, value: 10, ...(expiry ? { expiry } : {}) });

  it('lists vouchers expiring today through 14 days ahead, soonest first', () => {
    const result = vouchersExpiringSoon(
      [v('Late', '2026-11-16'), v('Today', '2026-11-02'), v('Too far', '2026-11-17'), v('Gone', '2026-11-01'), v('Never')],
      today,
    );
    expect(result.map((x) => x.name)).toEqual(['Today', 'Late']);
  });
});
