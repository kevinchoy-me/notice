import { Subscription } from '../core/db';
import { toIsoDate, weeklyAwareness } from './awareness';

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
