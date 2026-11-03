import { DestroyRef, Injectable, inject } from '@angular/core';
import { Router, Scroll } from '@angular/router';

/**
 * Calm scrolling between pages:
 * - following a link glides smoothly back to the top;
 * - Back and Forward return instantly to where you were;
 * - "Reduce motion" in the device settings turns the glide off.
 * Needs withInMemoryScrolling({ scrollPositionRestoration: 'disabled' }) so the router emits
 * Scroll events without scrolling on its own.
 */
@Injectable({ providedIn: 'root' })
export class CalmScrolling {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  start(): void {
    if (typeof window === 'undefined') return; // nothing to scroll during prerender

    // matchMedia is missing in some environments (e.g. unit tests); treat that as "no preference".
    const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const sub = this.router.events.subscribe((event) => {
      if (!(event instanceof Scroll)) return;
      if (event.position) {
        const [left, top] = event.position;
        window.scrollTo({ left, top, behavior: 'instant' });
      } else if (!event.anchor) {
        window.scrollTo({ top: 0, behavior: reduceMotion() ? 'instant' : 'smooth' });
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
