import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { loadSubscriptions } from '../core/renewals';
import { WeeklyAwareness, weeklyAwareness } from './awareness';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './home.html',
})
export class Home {
  protected readonly awareness = signal<WeeklyAwareness | null>(null);
  protected readonly loadFailed = signal(false);

  constructor() {
    // IndexedDB only exists in the browser, so never read during prerender.
    afterNextRender(async () => {
      try {
        const subscriptions = await loadSubscriptions();
        this.awareness.set(weeklyAwareness(subscriptions, new Date()));
      } catch {
        this.loadFailed.set(true);
      }
    });
  }
}
