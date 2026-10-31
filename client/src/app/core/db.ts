import Dexie, { Table } from 'dexie';

export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  cycle: 'monthly' | 'yearly';
  nextRenewal: string; // ISO date string
  /** Day of month the renewal belongs on (1–31), so a 31st stays the 31st after a shorter month. */
  anchorDay?: number;
  notes?: string;
}

export class OccuraDB extends Dexie {
  subscriptions!: Table<Subscription>;

  constructor() {
    super('OccuraDB');
    this.version(1).stores({
      subscriptions: '++id, name, nextRenewal'
    });
    // v2: remember each renewal's day of month. Existing records take it from their current date.
    this.version(2)
      .stores({ subscriptions: '++id, name, nextRenewal' })
      .upgrade((tx) =>
        tx
          .table<Subscription>('subscriptions')
          .toCollection()
          .modify((s) => {
            s.anchorDay ??= dayOf(s.nextRenewal);
          }),
      );
  }
}

export const db = new OccuraDB();

/** Day of month from a YYYY-MM-DD date. */
export function dayOf(isoDate: string): number {
  return Number(isoDate.slice(8, 10));
}
