import { DatePipe } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Voucher, db } from '../core/db';
import { MoneyPipe } from '../core/money';
import { loadSubscriptions } from '../core/renewals';
import { RecentExpenses, WeeklyAwareness, recentExpenses, vouchersExpiringSoon, weeklyAwareness } from './awareness';

interface HomeView {
  subscriptions: WeeklyAwareness;
  expenses: RecentExpenses;
  vouchers: Voucher[];
  /** Nothing saved anywhere yet. */
  empty: boolean;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, MoneyPipe],
  templateUrl: './home.html',
})
export class Home {
  protected readonly view = signal<HomeView | null>(null);
  protected readonly loadFailed = signal(false);

  constructor() {
    // IndexedDB only exists in the browser, so never read during prerender.
    afterNextRender(async () => {
      try {
        const today = new Date();
        const [subscriptions, expenses, vouchers] = await Promise.all([
          loadSubscriptions(today),
          db.expenses.toArray(),
          db.vouchers.toArray(),
        ]);
        this.view.set({
          subscriptions: weeklyAwareness(subscriptions, today),
          expenses: recentExpenses(expenses, today),
          vouchers: vouchersExpiringSoon(vouchers, today),
          empty: subscriptions.length + expenses.length + vouchers.length === 0,
        });
      } catch {
        this.loadFailed.set(true);
      }
    });
  }
}
