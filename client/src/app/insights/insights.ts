import { DatePipe } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyPipe } from '../core/money';
import { Subscription } from '../core/db';
import { loadSubscriptions } from '../core/renewals';
import { monthlyTotal } from '../home/awareness';

@Component({
  selector: 'app-insights',
  imports: [RouterLink, DatePipe, MoneyPipe],
  templateUrl: './insights.html',
})
export class Insights {
  protected readonly subscriptions = signal<Subscription[] | null>(null);
  protected readonly monthlyTotal = signal(0);
  protected readonly loadFailed = signal(false);

  constructor() {
    // IndexedDB only exists in the browser, so never read during prerender.
    afterNextRender(async () => {
      try {
        const subs = await loadSubscriptions();
        this.subscriptions.set(subs);
        this.monthlyTotal.set(monthlyTotal(subs));
      } catch {
        this.loadFailed.set(true);
      }
    });
  }
}
