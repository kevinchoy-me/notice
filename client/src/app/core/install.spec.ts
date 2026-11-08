import {
  INSTALL_DISMISSED_KEY,
  INSTALL_SNOOZE_DAYS,
  InstallOffer,
  InstallPromptEvent,
  installSnoozed,
  isIosSafari,
  snoozeInstall,
} from './install';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1';
const IPAD_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';

describe('isIosSafari', () => {
  it('matches iPhone Safari and iPad Safari (which reports a Mac with touch)', () => {
    expect(isIosSafari(IPHONE_SAFARI, 5)).toBe(true);
    expect(isIosSafari(IPAD_SAFARI, 5)).toBe(true);
  });

  it('skips other iOS browsers, desktop Safari and Android', () => {
    expect(isIosSafari(IPHONE_CHROME, 5)).toBe(false);
    expect(isIosSafari(IPAD_SAFARI, 0)).toBe(false);
    expect(isIosSafari(ANDROID_CHROME, 5)).toBe(false);
  });
});

describe('install snooze', () => {
  beforeEach(() => localStorage.clear());

  it('lasts the snooze period, then lapses', () => {
    const at = new Date(2026, 0, 1);
    expect(installSnoozed(at)).toBe(false);
    snoozeInstall(at);
    expect(localStorage.getItem(INSTALL_DISMISSED_KEY)).toBe(at.toISOString());
    expect(installSnoozed(new Date(2026, 0, INSTALL_SNOOZE_DAYS))).toBe(true);
    expect(installSnoozed(new Date(2026, 0, INSTALL_SNOOZE_DAYS + 2))).toBe(false);
  });

  it('ignores an unreadable stored value', () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'nonsense');
    expect(installSnoozed()).toBe(false);
  });
});

describe('InstallOffer', () => {
  beforeEach(() => localStorage.clear());

  function fakeWindow(
    opts: { standalone?: boolean; ua?: string; early?: InstallPromptEvent } = {},
  ) {
    const target = new EventTarget();
    return Object.assign(target, {
      matchMedia: () => ({ matches: !!opts.standalone }),
      navigator: { userAgent: opts.ua ?? ANDROID_CHROME, maxTouchPoints: 5 },
      __occurraInstall: opts.early,
    }) as unknown as Window & { __occurraInstall?: InstallPromptEvent };
  }

  function fakeEvent(outcome: 'accepted' | 'dismissed' = 'accepted'): InstallPromptEvent {
    return Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: vi.fn(async () => {}),
      userChoice: Promise.resolve({ outcome }),
    });
  }

  it('offers the button once the browser fires its install event', () => {
    const win = fakeWindow();
    const offer = new InstallOffer();
    offer.start(win);
    expect(offer.method()).toBeNull();
    win.dispatchEvent(fakeEvent());
    expect(offer.method()).toBe('prompt');
  });

  it('picks up an event caught before the app started', () => {
    const offer = new InstallOffer();
    offer.start(fakeWindow({ early: fakeEvent() }));
    expect(offer.method()).toBe('prompt');
  });

  it('shows Home Screen steps on iPhone Safari', () => {
    const offer = new InstallOffer();
    offer.start(fakeWindow({ ua: IPHONE_SAFARI }));
    expect(offer.method()).toBe('ios');
  });

  it('stays hidden when already installed or snoozed', () => {
    const installed = new InstallOffer();
    installed.start(fakeWindow({ standalone: true, early: fakeEvent() }));
    expect(installed.method()).toBeNull();

    snoozeInstall();
    const snoozed = new InstallOffer();
    snoozed.start(fakeWindow({ early: fakeEvent() }));
    expect(snoozed.method()).toBeNull();
  });

  it('opens the browser dialog and snoozes if it is declined', async () => {
    const e = fakeEvent('dismissed');
    const offer = new InstallOffer();
    offer.start(fakeWindow({ early: e }));
    await offer.install();
    expect(e.prompt).toHaveBeenCalled();
    expect(offer.method()).toBeNull();
    expect(installSnoozed()).toBe(true);
  });

  it('hides after "Not now"', () => {
    const offer = new InstallOffer();
    offer.start(fakeWindow({ ua: IPHONE_SAFARI }));
    offer.dismiss();
    expect(offer.method()).toBeNull();
    expect(installSnoozed()).toBe(true);
  });
});
