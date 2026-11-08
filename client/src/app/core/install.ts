import { Injectable, signal } from '@angular/core';

/** localStorage key: when the install banner was last dismissed (ISO date). This device only. */
export const INSTALL_DISMISSED_KEY = 'occurra.installDismissed';

/** After "Not now", the banner stays away this long. */
export const INSTALL_SNOOZE_DAYS = 30;

/** The browser's install event (Chrome, Edge, Samsung Internet). Not in TypeScript's DOM types yet. */
export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * How this browser can install Occurra:
 * - 'prompt': it offered the install event, so one button opens the browser's own dialog.
 * - 'ios': iPhone/iPad Safari, which only installs through Share → Add to Home Screen.
 * - null: already installed, or the browser has no install option (e.g. Firefox desktop).
 */
export type InstallMethod = 'prompt' | 'ios' | null;

/** True when Occurra is running as the installed app rather than in a browser tab. */
export function isStandalone(win: Window = window): boolean {
  return (
    win.matchMedia?.('(display-mode: standalone)').matches === true ||
    (win.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * iPhone or iPad Safari. Other iOS browsers (Chrome, Firefox, Edge) add "CriOS"/"FxiOS"/"EdgiOS";
 * they can also add to the Home Screen on recent iOS, but their menus differ, so only Safari gets steps.
 * iPadOS reports itself as a Mac, so a Mac with a touch screen counts as an iPad.
 */
export function isIosSafari(userAgent: string, maxTouchPoints: number): boolean {
  const ios =
    /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  return ios && /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
}

/** Whether a "Not now" is still in effect. */
export function installSnoozed(now = new Date()): boolean {
  try {
    const stored = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (!stored) return false;
    const at = new Date(stored);
    if (isNaN(at.getTime())) return false;
    return now.getTime() - at.getTime() < INSTALL_SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return true; // storage blocked: "Not now" could never stick, so don't keep asking
  }
}

export function snoozeInstall(now = new Date()): void {
  try {
    localStorage.setItem(INSTALL_DISMISSED_KEY, now.toISOString());
  } catch {
    // storage blocked: nothing to remember
  }
}

/**
 * Tracks whether to offer installing Occurra. Browser only: call start() after the first render.
 * The install event is captured early by a small script in index.html, because it can fire before
 * Angular starts; this picks it up from there and also listens for later ones.
 */
@Injectable({ providedIn: 'root' })
export class InstallOffer {
  readonly method = signal<InstallMethod>(null);
  private deferred: InstallPromptEvent | null = null;
  private started = false;

  start(win: Window & { __occurraInstall?: InstallPromptEvent } = window): void {
    if (this.started) return;
    this.started = true;
    if (isStandalone(win) || installSnoozed()) return;

    if (win.__occurraInstall) this.offer(win.__occurraInstall);
    win.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.offer(e as InstallPromptEvent);
    });
    win.addEventListener('appinstalled', () => this.clear());

    if (!this.deferred && isIosSafari(win.navigator.userAgent, win.navigator.maxTouchPoints ?? 0)) {
      this.method.set('ios');
    }
  }

  /** Opens the browser's install dialog. The event can only be used once, either way. */
  async install(): Promise<void> {
    const e = this.deferred;
    if (!e) return;
    this.clear();
    try {
      await e.prompt();
      const { outcome } = await e.userChoice;
      if (outcome === 'dismissed') snoozeInstall();
    } catch {
      // the browser refused (e.g. already used); nothing to do
    }
  }

  dismiss(): void {
    snoozeInstall();
    this.clear();
  }

  private offer(e: InstallPromptEvent): void {
    if (installSnoozed()) return;
    this.deferred = e;
    this.method.set('prompt');
  }

  private clear(): void {
    this.deferred = null;
    (window as Window & { __occurraInstall?: InstallPromptEvent }).__occurraInstall = undefined;
    this.method.set(null);
  }
}
