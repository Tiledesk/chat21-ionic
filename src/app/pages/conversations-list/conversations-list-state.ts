/**
 * After a conversation has been removed from the list (by any cause: close,
 * leave, handoff, reassignment, Remove human...), decide whether the loading
 * skeleton must be replaced by the empty-list message.
 * A removal event implies conversations had already arrived, so it can never
 * hide the initial-load skeleton. `removed` is null for the BehaviorSubject's
 * initial emission.
 */
export function shouldStopLoadingAfterRemoval(removed: any, remainingLength: number | undefined | null): boolean {
  return !!removed && remainingLength === 0;
}
