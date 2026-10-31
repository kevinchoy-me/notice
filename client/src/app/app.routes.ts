import { Routes } from '@angular/router';
import { About } from './about/about';
import { Guide } from './guide/guide';
import { Home } from './home/home';
import { Insights } from './insights/insights';
import { Subscriptions } from './subscriptions/subscriptions';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Occurra · Quiet awareness for recurring money',
    data: {
      description:
        'See which subscriptions renew this week and what they come to each month. Private and local: nothing leaves your browser.',
    },
  },
  {
    path: 'subscriptions',
    component: Subscriptions,
    title: 'Subscriptions · Occurra',
    data: {
      description:
        'Keep a calm list of your subscriptions and recurring payments, with renewal dates that stay up to date. Stored only in your browser.',
    },
  },
  {
    path: 'insights',
    component: Insights,
    title: 'Your renewals · Occurra',
    data: {
      description:
        'Every renewal in date order, with a quiet monthly total. Private by design: your data never leaves this device.',
    },
  },
  {
    path: 'about',
    component: About,
    title: 'About Occurra · A calm way to keep track of subscriptions',
    data: {
      description:
        'Notice which subscriptions renew this week and what they add up to each month. No account, no bank link: your data stays on your device.',
    },
  },
  {
    path: 'track-subscriptions',
    component: Guide,
    title: 'How to keep track of subscriptions, calmly · Occurra',
    data: {
      description:
        'A simple, calm way to keep track of subscriptions: one list, the next renewal date, a monthly total and a weekly glance. No budgets, no judgment.',
    },
  },
];
