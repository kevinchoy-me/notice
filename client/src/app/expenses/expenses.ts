import { DatePipe } from '@angular/common';
import { Component, afterNextRender, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense, db } from '../core/db';
import { MoneyPipe } from '../core/money';
import { toIsoDate } from '../core/renewals';

@Component({
  selector: 'app-expenses',
  imports: [ReactiveFormsModule, DatePipe, MoneyPipe],
  templateUrl: './expenses.html',
})
export class Expenses {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly expenses = signal<Expense[]>([]);
  protected readonly loaded = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required],
    notes: [''],
  });

  constructor() {
    // IndexedDB only exists in the browser, so never load during prerender.
    afterNextRender(() => {
      this.resetForm();
      this.load().catch(() => this.loadFailed.set(true));
    });
  }

  protected async add(): Promise<void> {
    if (this.form.invalid || this.saving()) return;

    const { name, amount, date, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.saveFailed.set(false);
    try {
      const note = notes.trim();
      await db.expenses.add({ name: name.trim(), amount: amount!, date, ...(note ? { notes: note } : {}) });
      this.resetForm();
      await this.load();
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  /** Newest first; same-day expenses show the most recently added first. */
  private async load(): Promise<void> {
    this.expenses.set(await db.expenses.orderBy('date').reverse().toArray());
    this.loaded.set(true);
  }

  /** Clears the form and defaults the date to today (set in the browser, never at build time). */
  private resetForm(): void {
    this.form.reset({ name: '', amount: null, date: toIsoDate(new Date()), notes: '' });
  }
}
