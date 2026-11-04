import { WELCOME_DONE_KEY, WELCOME_STEPS, markWelcomeSeen, welcomeSeen } from './welcome';

describe('welcome flag', () => {
  beforeEach(() => localStorage.clear());

  it('is unseen until marked, then stays seen', () => {
    expect(welcomeSeen()).toBe(false);
    markWelcomeSeen();
    expect(welcomeSeen()).toBe(true);
    expect(localStorage.getItem(WELCOME_DONE_KEY)).toBe('1');
  });

  it('has three short steps', () => {
    expect(WELCOME_STEPS.length).toBe(3);
  });
});
