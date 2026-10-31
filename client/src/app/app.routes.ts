import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Insights } from './insights/insights';
import { Subscriptions } from './subscriptions/subscriptions';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Occura · Quiet awareness for recurring money',
    data: {
      description:
        'See which subscriptions renew this week and what they come to each month. Private and local: nothing leaves your browser.',
    },
  },
  {
    path: 'subscriptions',
    component: Subscriptions,
    title: 'Subscriptions · Occura',
    data: {
      description:
        'Keep a calm list of your subscriptions and recurring payments, with renewal dates that stay up to date. Stored only in your browser.',
    },
  },
  {
    path: 'insights',
    component: Insights,
    title: 'Your renewals · Occura',
    data: {
      description:
        'Every renewal in date order, with a quiet monthly total. Private by design: your data never leaves this device.',
    },
  },
];
