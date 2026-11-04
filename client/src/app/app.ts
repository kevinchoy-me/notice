import { Component, afterNextRender, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CalmScrolling } from './core/scroll';
import { recordOpen } from './core/visits';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    inject(CalmScrolling).start();
    // Note this visit as "last opened" (localStorage, this device only) once per app load.
    afterNextRender(() => recordOpen());
  }

  protected readonly links = [
    { path: '/', label: 'Home' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/vouchers', label: 'Vouchers' },
    { path: '/insights', label: 'Insights' },
  ];

  protected readonly footerLinks = [
    { path: '/about', label: 'About Occurra' },
    { path: '/track-subscriptions', label: 'Keeping track of subscriptions' },
    { path: '/track-gift-cards', label: 'Keeping track of gift cards' },
    { path: '/privacy', label: 'Privacy' },
  ];
}
