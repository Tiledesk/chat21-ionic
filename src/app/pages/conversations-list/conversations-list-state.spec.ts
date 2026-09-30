import { shouldStopLoadingAfterRemoval } from './conversations-list-state';

describe('shouldStopLoadingAfterRemoval', () => {
  it('is true when a conversation was removed and the list is now empty', () => {
    expect(shouldStopLoadingAfterRemoval({ uid: 'a' }, 0)).toBe(true);
  });
  it('is false when other conversations remain', () => {
    expect(shouldStopLoadingAfterRemoval({ uid: 'a' }, 2)).toBe(false);
  });
  it('is false for the BehaviorSubject initial null emission (no removal happened)', () => {
    expect(shouldStopLoadingAfterRemoval(null, 0)).toBe(false);
  });
  it('is false when the list is not available', () => {
    expect(shouldStopLoadingAfterRemoval({ uid: 'a' }, undefined)).toBe(false);
  });
});
