import { DatePipe } from '@angular/common';
import { Component, afterNextRender, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Voucher, db } from '../core/db';
import { MoneyPipe } from '../core/money';
import { toIsoDate } from '../core/renewals';
import { sortVouchers } from './sort';

@Component({
  selector: 'app-vouchers',
  imports: [ReactiveFormsModule, DatePipe, MoneyPipe],
  templateUrl: './vouchers.html',
})
export class Vouchers {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly vouchers = signal<Voucher[]>([]);
  protected readonly loaded = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);
  /** Today as YYYY-MM-DD, set in the browser, so a passed expiry can read "Expired". */
  protected readonly today = signal('');

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    value: [null as number | null, [Validators.required, Validators.min(0)]],
    expiry: [''],
    notes: [''],
  });

  constructor() {
    // IndexedDB only exists in the browser, so never load during prerender.
    afterNextRender(() => {
      this.today.set(toIsoDate(new Date()));
      this.load().catch(() => this.loadFailed.set(true));
    });
  }

  protected async add(): Promise<void> {
    if (this.form.invalid || this.saving()) return;

    const { name, value, expiry, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.saveFailed.set(false);
    try {
      const note = notes.trim();
      await db.vouchers.add({
        name: name.trim(),
        value: value!,
        ...(expiry ? { expiry } : {}),
        ...(note ? { notes: note } : {}),
      });
      this.form.reset();
      await this.load();
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    this.vouchers.set(sortVouchers(await db.vouchers.toArray()));
    this.loaded.set(true);
  }
}
