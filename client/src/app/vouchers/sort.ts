import { Voucher } from '../core/db';

/** Vouchers with an expiry first, soonest first; then those without one, by name. */
export function sortVouchers(vouchers: Voucher[]): Voucher[] {
  return [...vouchers].sort((a, b) => {
    if (a.expiry && b.expiry) return a.expiry.localeCompare(b.expiry) || byName(a, b);
    if (a.expiry) return -1;
    if (b.expiry) return 1;
    return byName(a, b);
  });
}

function byName(a: Voucher, b: Voucher): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}
