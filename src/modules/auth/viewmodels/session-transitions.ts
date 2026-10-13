/** Serialize cookie-changing requests so an old signout cannot delete a new login. */
export class SessionTransitions {
  private tail: Promise<void> = Promise.resolve();
  run<T>(operation: () => Promise<T>): Promise<T> {
    const pending = this.tail.then(operation);
    this.tail = pending.then(() => {}, () => {});
    return pending;
  }
}
