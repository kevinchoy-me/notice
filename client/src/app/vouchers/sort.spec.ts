import { Voucher } from '../core/db';
import { sortVouchers } from './sort';

const v = (name: string, expiry?: string): Voucher => ({ name, value: 10, ...(expiry ? { expiry } : {}) });

describe('sortVouchers', () => {
  it('puts the soonest expiry first', () => {
    const result = sortVouchers([v('B', '2027-03-01'), v('A', '2026-12-01'), v('C', '2027-01-15')]);
    expect(result.map((x) => x.name)).toEqual(['A', 'C', 'B']);
  });

  it('lists vouchers without an expiry after the dated ones, by name', () => {
    const result = sortVouchers([v('zoo pass'), v('Books', '2027-01-01'), v('Apple card'), v('Cinema', '2026-11-20')]);
    expect(result.map((x) => x.name)).toEqual(['Cinema', 'Books', 'Apple card', 'zoo pass']);
  });

  it('breaks a shared expiry date by name', () => {
    const result = sortVouchers([v('Spa', '2027-01-01'), v('cafe', '2027-01-01')]);
    expect(result.map((x) => x.name)).toEqual(['cafe', 'Spa']);
  });

  it('does not change the list it was given', () => {
    const input = [v('B'), v('A')];
    sortVouchers(input);
    expect(input.map((x) => x.name)).toEqual(['B', 'A']);
  });
});
