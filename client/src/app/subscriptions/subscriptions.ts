import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, afterNextRender, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, dayOf, db } from '../core/db';
import { loadSubscriptions, notPastDate, toIsoDate } from '../core/renewals';

@Component({
  selector: 'app-subscriptions',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './subscriptions.html',
})
export class Subscriptions {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly subscriptions = signal<Subscription[]>([]);
  protected readonly loaded = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);

  protected readonly editingId = signal<number | null>(null);
  protected readonly removingId = signal<number | null>(null);
  protected readonly listFailed = signal(false);

  /** Earliest date the date pickers offer; set in the browser so the build date never ends up in the HTML. */
  protected readonly minDate = signal<string | null>(null);

  protected readonly form = this.createForm();
  protected readonly editForm = this.createForm();

  constructor() {
    // IndexedDB only exists in the browser, so never load during prerender.
    afterNextRender(() => {
      this.minDate.set(toIsoDate(new Date()));
      this.load().catch(() => this.loadFailed.set(true));
    });
  }

  protected async add(): Promise<void> {
    if (this.form.invalid || this.saving()) return;

    const { name, amount, cycle, nextRenewal } = this.form.getRawValue();
    this.saving.set(true);
    this.saveFailed.set(false);
    try {
      await db.subscriptions.add({
        name: name.trim(),
        amount: amount!,
        cycle,
        nextRenewal,
        anchorDay: dayOf(nextRenewal),
      });
      this.form.reset();
      await this.load();
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  protected startEdit(sub: Subscription): void {
    this.removingId.set(null);
    this.listFailed.set(false);
    this.editForm.reset({
      name: sub.name,
      amount: sub.amount,
      cycle: sub.cycle,
      nextRenewal: sub.nextRenewal,
    });
    this.editingId.set(sub.id!);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected async saveEdit(id: number): Promise<void> {
    if (this.editForm.invalid) return;

    const { name, amount, cycle, nextRenewal } = this.editForm.getRawValue();
    const dateChanged = this.subscriptions().find((s) => s.id === id)?.nextRenewal !== nextRenewal;
    await this.run(async () => {
      await db.subscriptions.update(id, {
        name: name.trim(),
        amount: amount!,
        cycle,
        nextRenewal,
        // A new date sets a new anchor; an unchanged one keeps it (a 31st shown as 30 Nov stays a 31st).
        ...(dateChanged ? { anchorDay: dayOf(nextRenewal) } : {}),
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
      await db.subscriptions.delete(id);
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
    this.subscriptions.set(await loadSubscriptions());
    this.loaded.set(true);
  }

  private createForm() {
    return this.fb.group({
      name: ['', Validators.required],
      amount: [null as number | null, [Validators.required, Validators.min(0)]],
      cycle: ['monthly' as Subscription['cycle'], Validators.required],
      nextRenewal: ['', [Validators.required, notPastDate]],
    });
  }
}
