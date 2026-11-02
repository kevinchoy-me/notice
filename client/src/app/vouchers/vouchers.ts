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

  protected readonly editingId = signal<number | null>(null);
  protected readonly removingId = signal<number | null>(null);
  protected readonly listFailed = signal(false);

  protected readonly form = this.createForm();
  protected readonly editForm = this.createForm();

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

  protected startEdit(voucher: Voucher): void {
    this.removingId.set(null);
    this.listFailed.set(false);
    this.editForm.reset({
      name: voucher.name,
      value: voucher.value,
      expiry: voucher.expiry ?? '',
      notes: voucher.notes ?? '',
    });
    this.editingId.set(voucher.id!);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected async saveEdit(id: number): Promise<void> {
    if (this.editForm.invalid) return;

    const { name, value, expiry, notes } = this.editForm.getRawValue();
    await this.run(async () => {
      // A cleared expiry or note is removed (Dexie deletes a property set to undefined).
      await db.vouchers.update(id, {
        name: name.trim(),
        value: value!,
        expiry: expiry || undefined,
        notes: notes.trim() || undefined,
      });
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
      await db.vouchers.delete(id);
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

  private async load(): Promise<void> {
    this.vouchers.set(sortVouchers(await db.vouchers.toArray()));
    this.loaded.set(true);
  }

  private createForm() {
    return this.fb.group({
      name: ['', Validators.required],
      value: [null as number | null, [Validators.required, Validators.min(0)]],
      expiry: [''],
      notes: [''],
    });
  }
}
