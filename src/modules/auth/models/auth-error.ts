export class AuthError extends Error {
  constructor(message: string, readonly code?: string, readonly status?: number, readonly path?: string, readonly operation?: string) {
    super(message);
    this.name = 'AuthError';
  }
}
