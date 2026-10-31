import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

/** The one currency Occura shows. Change it here; there is no picker yet. */
export const CURRENCY_CODE = 'USD';

/** Formats an amount quietly with the currency symbol, e.g. 12.99 → $12.99. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';
    return formatCurrency(value, 'en-US', getCurrencySymbol(CURRENCY_CODE, 'narrow', 'en-US'), CURRENCY_CODE, '1.2-2');
  }
}
