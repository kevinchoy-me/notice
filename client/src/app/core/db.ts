import Dexie, { Table } from 'dexie';

export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  cycle: 'monthly' | 'yearly';
  nextRenewal: string; // ISO date string
  notes?: string;
}

export class OccuraDB extends Dexie {
  subscriptions!: Table<Subscription>;

  constructor() {
    super('OccuraDB');
    this.version(1).stores({
      subscriptions: '++id, name, nextRenewal'
    });
  }
}

export const db = new OccuraDB();
