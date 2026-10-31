import { MoneyPipe } from './money';

describe('MoneyPipe', () => {
  const money = new MoneyPipe();

  it('shows two decimals with the currency symbol', () => {
    expect(money.transform(12.99)).toBe('$12.99');
    expect(money.transform(10)).toBe('$10.00');
    expect(money.transform(1234.5)).toBe('$1,234.50');
  });

  it('is empty for a missing amount', () => {
    expect(money.transform(null)).toBe('');
  });
});
