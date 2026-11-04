import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    title: 'Occurra · Quiet awareness for recurring money',
    data: {
      description:
        'See which subscriptions renew this week and what they come to each month. Private and local: nothing leaves your browser.',
    },
  },
  {
    path: 'subscriptions',
    loadComponent: () => import('./subscriptions/subscriptions').then((m) => m.Subscriptions),
    title: 'Subscriptions · Occurra',
    data: {
      description:
        'Keep a calm list of your subscriptions and recurring payments, with renewal dates that stay up to date. Stored only in your browser.',
    },
  },
  {
    path: 'expenses',
    loadComponent: () => import('./expenses/expenses').then((m) => m.Expenses),
    title: 'Expenses · Occurra',
    data: {
      description:
        'A light, private list of everyday expenses, newest first. No categories, no budgets. Stored only in your browser.',
    },
  },
  {
    path: 'vouchers',
    loadComponent: () => import('./vouchers/vouchers').then((m) => m.Vouchers),
    title: 'Vouchers · Occurra',
    data: {
      description:
        'Keep gift cards and vouchers in one calm list, with the soonest expiry first, so they get used. Stored only in your browser.',
    },
  },
  {
    path: 'insights',
    loadComponent: () => import('./insights/insights').then((m) => m.Insights),
    title: 'Your renewals · Occurra',
    data: {
      description:
        'Every renewal in date order, with a quiet monthly total. Private by design: your data never leaves this device.',
    },
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then((m) => m.About),
    title: 'About Occurra · A calm way to keep track of subscriptions',
    data: {
      description:
        'Notice which subscriptions renew this week and what they add up to each month. No account, no bank link: your data stays on your device.',
    },
  },
  {
    path: 'track-subscriptions',
    loadComponent: () => import('./guide/guide').then((m) => m.Guide),
    title: 'How to keep track of subscriptions, calmly · Occurra',
    data: {
      description:
        'A simple, calm way to keep track of subscriptions: one list, the next renewal date, a monthly total and a weekly glance. No budgets, no judgment.',
    },
  },
  {
    path: 'track-gift-cards',
    loadComponent: () => import('./gift-cards/gift-cards').then((m) => m.GiftCards),
    title: 'How to keep track of gift cards and vouchers · Occurra',
    data: {
      description:
        'A calm way to keep gift cards and vouchers in one place, with expiry dates in view, so they get used. Private: everything stays on your device.',
    },
  },
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/privacy').then((m) => m.Privacy),
    title: 'Privacy · Occurra',
    data: {
      description:
        'Your lists stay in your browser and are never sent anywhere. No accounts, no ads, no cookies, and only simple, anonymous visit counts.',
    },
  },
];
