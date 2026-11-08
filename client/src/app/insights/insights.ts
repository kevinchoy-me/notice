import { DatePipe } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyPipe } from '../core/money';
import { Subscription, db } from '../core/db';
import { loadSubscriptions } from '../core/renewals';
import { LastOpened, countOf, describeLastOpened, previousOpen } from '../core/visits';
import { monthlyTotal } from '../home/awareness';

interface OnThisDevice {
  subscriptions: number;
  expenses: number;
  vouchers: number;
  lastOpened: LastOpened | null;
}

@Component({
  selector: 'app-insights',
  imports: [RouterLink, DatePipe, MoneyPipe],
  templateUrl: './insights.html',
})
export class Insights {
  protected readonly subscriptions = signal<Subscription[] | null>(null);
  protected readonly monthlyTotal = signal(0);
  protected readonly loadFailed = signal(false);
  /** Counts and last-opened, read from this device only. Nothing here is sent anywhere. */
  protected readonly device = signal<OnThisDevice | null>(null);
  protected readonly countOf = countOf;

  constructor() {
    // IndexedDB and localStorage only exist in the browser, so never read during prerender.
    afterNextRender(async () => {
      try {
        const [subs, expenses, vouchers] = await Promise.all([
          loadSubscriptions(),
          db.expenses.count(),
          db.vouchers.count(),
        ]);
        this.subscriptions.set(subs);
        this.monthlyTotal.set(monthlyTotal(subs));
        this.device.set({
          subscriptions: subs.length,
          expenses,
          vouchers,
          lastOpened: describeLastOpened(previousOpen(), new Date()),
        });
      } catch {
        this.loadFailed.set(true);
      }
    });
  }
}
