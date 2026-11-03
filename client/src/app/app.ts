import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CalmScrolling } from './core/scroll';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    inject(CalmScrolling).start();
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
    { path: '/privacy', label: 'Privacy' },
  ];
}
