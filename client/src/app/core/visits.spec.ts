import { LAST_OPENED_KEY, countOf, describeLastOpened, previousOpen, recordOpen, resetRecordedOpen } from './visits';

describe('describeLastOpened', () => {
  const today = new Date(2026, 10, 4, 22, 0); // Wed 4 Nov 2026, 10pm

  it('is empty on the first visit', () => {
    expect(describeLastOpened(null, today)).toBeNull();
  });

  it('says today, yesterday, or gives the date', () => {
    expect(describeLastOpened(new Date(2026, 10, 4, 8, 0), today)).toEqual({ when: 'today' });
    expect(describeLastOpened(new Date(2026, 10, 3, 23, 59), today)).toEqual({ when: 'yesterday' });
    const older = new Date(2026, 9, 30, 12, 0);
    expect(describeLastOpened(older, today)).toEqual({ when: 'date', date: older });
  });
});

describe('recordOpen', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecordedOpen();
  });

  it('remembers the previous open and stores this one', () => {
    localStorage.setItem(LAST_OPENED_KEY, '2026-11-01T09:00:00.000Z');
    const now = new Date('2026-11-04T14:00:00.000Z');
    recordOpen(now);
    expect(previousOpen()?.toISOString()).toBe('2026-11-01T09:00:00.000Z');
    expect(localStorage.getItem(LAST_OPENED_KEY)).toBe(now.toISOString());
  });

  it('only records once per load', () => {
    recordOpen(new Date('2026-11-04T14:00:00.000Z'));
    recordOpen(new Date('2026-11-04T15:00:00.000Z'));
    expect(previousOpen()).toBeNull();
    expect(localStorage.getItem(LAST_OPENED_KEY)).toBe('2026-11-04T14:00:00.000Z');
  });

  it('ignores an unreadable stored value', () => {
    localStorage.setItem(LAST_OPENED_KEY, 'not a date');
    recordOpen(new Date('2026-11-04T14:00:00.000Z'));
    expect(previousOpen()).toBeNull();
  });
});

describe('countOf', () => {
  it('uses the singular only for one', () => {
    expect(countOf(1, 'voucher')).toBe('1 voucher');
    expect(countOf(0, 'voucher')).toBe('0 vouchers');
    expect(countOf(3, 'expense')).toBe('3 expenses');
  });
});
