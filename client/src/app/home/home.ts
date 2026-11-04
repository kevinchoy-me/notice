import { DatePipe } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Voucher, db } from '../core/db';
import { MoneyPipe } from '../core/money';
import { loadSubscriptions } from '../core/renewals';
import { WELCOME_STEPS, markWelcomeSeen, welcomeSeen } from '../core/welcome';
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
  /** Index of the welcome step being shown, or null when the welcome is hidden. */
  protected readonly welcomeStep = signal<number | null>(null);
  protected readonly welcomeSteps = WELCOME_STEPS;

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
        // First visit only: show the short welcome while nothing is saved yet.
        // Someone who already has lists isn't new, so quietly mark it as seen instead.
        if (!welcomeSeen()) {
          if (subscriptions.length + expenses.length + vouchers.length === 0) this.welcomeStep.set(0);
          else markWelcomeSeen();
        }
      } catch {
        this.loadFailed.set(true);
      }
    });
  }

  protected nextWelcomeStep(): void {
    const step = this.welcomeStep();
    if (step === null) return;
    if (step + 1 < this.welcomeSteps.length) this.welcomeStep.set(step + 1);
    else this.closeWelcome();
  }

  protected closeWelcome(): void {
    markWelcomeSeen();
    this.welcomeStep.set(null);
  }
}
