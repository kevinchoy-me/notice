import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, afterNextRender, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, db } from '../core/db';

@Component({
  selector: 'app-subscriptions',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './subscriptions.html',
})
export class Subscriptions {
  protected readonly subscriptions = signal<Subscription[]>([]);
  protected readonly loaded = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    cycle: ['monthly' as Subscription['cycle'], Validators.required],
    nextRenewal: ['', Validators.required],
  });

  constructor() {
    // IndexedDB only exists in the browser, so never load during prerender.
    afterNextRender(() => this.load());
  }

  protected async add(): Promise<void> {
    if (this.form.invalid || this.saving()) return;

    const { name, amount, cycle, nextRenewal } = this.form.getRawValue();
    this.saving.set(true);
    this.saveFailed.set(false);
    try {
      await db.subscriptions.add({ name: name.trim(), amount: amount!, cycle, nextRenewal });
      this.form.reset();
      await this.load();
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    this.subscriptions.set(await db.subscriptions.orderBy('nextRenewal').toArray());
    this.loaded.set(true);
  }
}
