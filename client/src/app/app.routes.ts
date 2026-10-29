import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Insights } from './insights/insights';
import { Subscriptions } from './subscriptions/subscriptions';

export const routes: Routes = [
  { path: '', component: Home, title: 'Occura' },
  { path: 'subscriptions', component: Subscriptions, title: 'Subscriptions · Occura' },
  { path: 'insights', component: Insights, title: 'Insights · Occura' },
];
