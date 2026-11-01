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

  protected readonly editingId = signal<number | null>(null);
  protected readonly removingId = signal<number | null>(null);
  protected readonly listFailed = signal(false);

  protected readonly form = this.createForm();
  protected readonly editForm = this.createForm();

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

  protected startEdit(expense: Expense): void {
    this.removingId.set(null);
    this.listFailed.set(false);
    this.editForm.reset({
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      notes: expense.notes ?? '',
    });
    this.editingId.set(expense.id!);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected async saveEdit(id: number): Promise<void> {
    if (this.editForm.invalid) return;

    const { name, amount, date, notes } = this.editForm.getRawValue();
    await this.run(async () => {
      // An emptied note is removed (Dexie deletes a property set to undefined).
      await db.expenses.update(id, { name: name.trim(), amount: amount!, date, notes: notes.trim() || undefined });
      this.editingId.set(null);
    });
  }

  protected askRemove(id: number): void {
    this.editingId.set(null);
    this.listFailed.set(false);
    this.removingId.set(id);
  }

  protected keep(): void {
    this.removingId.set(null);
  }

  protected async remove(id: number): Promise<void> {
    await this.run(async () => {
      await db.expenses.delete(id);
      this.removingId.set(null);
    });
  }

  /** Runs a list change, then reloads; shows a quiet message if it fails. */
  private async run(change: () => Promise<void>): Promise<void> {
    this.listFailed.set(false);
    try {
      await change();
      await this.load();
    } catch {
      this.listFailed.set(true);
    }
  }

  /** Newest first; same-day expenses show the most recently added first. */
  private async load(): Promise<void> {
    this.expenses.set(await db.expenses.orderBy('date').reverse().toArray());
    this.loaded.set(true);
  }

  /** Clears the add form and defaults the date to today (set in the browser, never at build time). */
  private resetForm(): void {
    this.form.reset({ name: '', amount: null, date: toIsoDate(new Date()), notes: '' });
  }

  private createForm() {
    return this.fb.group({
      name: ['', Validators.required],
      amount: [null as number | null, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      notes: [''],
    });
  }
}
