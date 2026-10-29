import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { db } from '../core/db';
import { WeeklyAwareness, weeklyAwareness } from './awareness';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './home.html',
})
export class Home {
  protected readonly awareness = signal<WeeklyAwareness | null>(null);

  constructor() {
    // IndexedDB only exists in the browser, so never read during prerender.
    afterNextRender(async () => {
      const subscriptions = await db.subscriptions.toArray();
      this.awareness.set(weeklyAwareness(subscriptions, new Date()));
    });
  }
}
