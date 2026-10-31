import { advanceRenewal } from './renewals';

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
