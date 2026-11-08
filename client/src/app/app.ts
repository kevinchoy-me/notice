import { Component, afterNextRender, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { InstallOffer } from './core/install';
import { TIP_URL } from './core/support';
import { CalmScrolling } from './core/scroll';
import { previousOpen, recordOpen } from './core/visits';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly install = inject(InstallOffer);

  constructor() {
    inject(CalmScrolling).start();
    afterNextRender(() => {
      // Note this visit as "last opened" (localStorage, this device only) once per app load.
      recordOpen();
      // Offer installing from the second visit on, so it never stacks with the first-visit welcome.
      if (previousOpen()) this.install.start();
    });
  }

  protected readonly links = [
    { path: '/', label: 'Home' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/vouchers', label: 'Vouchers' },
    { path: '/insights', label: 'Insights' },
  ];

  /** Optional tip link shown in the footer; hidden while it's empty. */
  protected readonly tipUrl = TIP_URL;

  protected readonly footerLinks = [
    { path: '/about', label: 'About Occurra' },
    { path: '/track-subscriptions', label: 'Keeping track of subscriptions' },
    { path: '/track-gift-cards', label: 'Keeping track of gift cards' },
    { path: '/privacy', label: 'Privacy' },
  ];
}
