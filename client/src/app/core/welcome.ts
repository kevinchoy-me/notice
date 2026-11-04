/** localStorage flag: the short first-visit welcome on Home has been seen or skipped. This device only. */
export const WELCOME_DONE_KEY = 'occurra.welcomeDone';

export function welcomeSeen(): boolean {
  try {
    return localStorage.getItem(WELCOME_DONE_KEY) === '1';
  } catch {
    return true; // storage blocked: don't show something that can never be dismissed for good
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(WELCOME_DONE_KEY, '1');
  } catch {
    // storage blocked: nothing to remember
  }
}

/** The three short welcome steps shown on Home. */
export const WELCOME_STEPS = [
  {
    title: 'Welcome to Occurra',
    text: 'Add the subscriptions you pay for, each with its next renewal date. Everyday expenses and vouchers can live here too.',
  },
  {
    title: 'Notice the week',
    text: 'Home gathers what renews in the next seven days, what you noted recently and vouchers ending soon. A glance once a week is enough.',
  },
  {
    title: 'Everything stays here',
    text: 'Your lists are kept only in this browser, on this device. There’s no account, and nothing you add is sent anywhere.',
  },
] as const;
