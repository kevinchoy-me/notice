import { FormControl } from '@angular/forms';
import { advanceRenewal, notPastDate, toIsoDate } from './renewals';

describe('advanceRenewal', () => {
  const today = new Date(2026, 9, 31); // 31 Oct 2026, local time

  it('moves a past monthly date forward to the next renewal on or after today', () => {
    expect(advanceRenewal('2026-08-15', 'monthly', today)).toBe('2026-11-15');
  });

  it('lands on today when a whole number of cycles gets there exactly', () => {
    expect(advanceRenewal('2026-07-31', 'monthly', today)).toBe('2026-10-31');
  });

  it('moves a past yearly date forward by whole years', () => {
    expect(advanceRenewal('2024-03-10', 'yearly', today)).toBe('2027-03-10');
  });

  it('leaves today and future dates unchanged', () => {
    expect(advanceRenewal('2026-10-31', 'monthly', today)).toBe('2026-10-31');
    expect(advanceRenewal('2027-01-05', 'yearly', today)).toBe('2027-01-05');
  });

  it('uses the last day of shorter months without drifting', () => {
    const feb = new Date(2027, 1, 10); // 10 Feb 2027
    expect(advanceRenewal('2027-01-31', 'monthly', feb)).toBe('2027-02-28');
    const march = new Date(2027, 2, 5); // 5 Mar 2027
    expect(advanceRenewal('2027-01-31', 'monthly', march)).toBe('2027-03-31');
  });

  it('moves a 29 February yearly renewal to 28 February in common years', () => {
    expect(advanceRenewal('2024-02-29', 'yearly', today)).toBe('2027-02-28');
  });
});

describe('advanceRenewal with an anchor day', () => {
  it('returns a 31st to the 31st after a shorter month', () => {
    const march = new Date(2027, 2, 5); // 5 Mar 2027
    expect(advanceRenewal('2027-02-28', 'monthly', march, 31)).toBe('2027-03-31');
  });

  it('uses the last day when the anchor does not fit the target month', () => {
    const may = new Date(2027, 4, 1); // 1 May 2027
    expect(advanceRenewal('2027-03-31', 'monthly', may, 31)).toBe('2027-05-31');
    const lateApril = new Date(2027, 3, 2); // 2 Apr 2027
    expect(advanceRenewal('2027-03-31', 'monthly', lateApril, 31)).toBe('2027-04-30');
  });

  it('returns a 29 February yearly renewal to the 29th in leap years', () => {
    const march2027 = new Date(2027, 2, 1); // 1 Mar 2027
    expect(advanceRenewal('2027-02-28', 'yearly', march2027, 29)).toBe('2028-02-29');
  });
});

describe('notPastDate', () => {
  const control = (value: string) => new FormControl(value, { nonNullable: true });
  const today = toIsoDate(new Date());
  const yesterday = toIsoDate(new Date(Date.now() - 864e5 * 1.5));

  it('accepts today and later', () => {
    expect(notPastDate(control(today))).toBeNull();
    expect(notPastDate(control('2999-01-01'))).toBeNull();
  });

  it('rejects a past date', () => {
    expect(notPastDate(control(yesterday))).toEqual({ pastDate: true });
  });

  it('leaves an empty value to the required validator', () => {
    expect(notPastDate(control(''))).toBeNull();
  });
});
