import { getApiUrl } from '@/config/api';
import { AdapterError } from '@/shared/adapters/adapter-error';

type AuthRequestHooks = Readonly<{ cookieHeader(): Promise<string | null>; clear(): Promise<void>; onExpired(): void; sessionKey?(): string | null }>;
let authRequestHooks: AuthRequestHooks | null = null;
export function setAuthRequestHooks(hooks: AuthRequestHooks | null) { authRequestHooks = hooks; }

export type RequestOptions = Readonly<{ signal?: AbortSignal }>;

export interface HttpClient {
  get(path: string, options?: RequestOptions): Promise<unknown>;
}

export type HttpRequestOptions = RequestOptions & Readonly<{
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  authenticated?: boolean;
}>;
export type FetchImplementation = 'expo/fetch' | 'react-native/whatwg-fetch' | 'injected-fetch' | 'global-fetch';
export type HttpResult = Readonly<{ status: number; body: unknown; headers: Headers; responseType?: ResponseType; fetchImplementation?: FetchImplementation }>;
export interface HttpMutationClient extends HttpClient {
  request(path: string, options?: HttpRequestOptions): Promise<HttpResult>;
}

export class HttpError extends Error {
  readonly name = 'HttpError';

  constructor(readonly status: number, readonly body: unknown, readonly path: string) {
    super(`No fue posible cargar los datos (HTTP ${status}).`);
  }
}

/** Transport only: wrappers and DTO validation belong to the module adapters. */
export class FetchHttpClient implements HttpMutationClient {
  constructor(private readonly getBaseUrl: () => string, private readonly fetchImpl: typeof fetch = fetch) {}

  async get(path: string, options?: RequestOptions): Promise<unknown> {
    return (await this.request(path, options)).body;
  }

  async request(path: string, options: HttpRequestOptions = {}): Promise<HttpResult> {
    if (!path.startsWith('/api/')) throw new Error('Se requiere una ruta relativa de la API.');
    const hooks = authRequestHooks;
    const sessionKey = hooks?.sessionKey?.();
    const cookie = options.authenticated === false ? null : await hooks?.cookieHeader() ?? null;
    if (options.authenticated !== false && hooks?.sessionKey && sessionKey !== hooks.sessionKey()) throw new Error('La sesión cambió. Vuelve a intentar la operación.');
    const response = await this.fetchImpl(`${this.getBaseUrl()}${path}`, {
      method: options.method ?? 'GET',
      headers: { Accept: 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...options.headers },
      body: options.body,
      credentials: 'include',
      signal: options?.signal,
    });
    if (options.authenticated !== false && response.status === 401 && path !== '/api/auth/session' && hooks === authRequestHooks && sessionKey === hooks?.sessionKey?.()) {
      // A late 401 from account A must not clear account B's new session.
      await hooks?.clear();
      if (hooks === authRequestHooks && sessionKey === hooks?.sessionKey?.()) hooks?.onExpired();
    }
    const raw = await response.text();
    let body: unknown = null;
    if (raw.length > 0) {
      try {
        body = JSON.parse(raw);
      } catch {
        // Preserve HTTP failures even when the server/proxy returns HTML.
        if (!response.ok) throw new HttpError(response.status, raw, path);
        throw new AdapterError(path.split('?')[0], 'JSON válido');
      }
    }
    if (!response.ok) {
      throw new HttpError(response.status, body, path);
    }
    const fetchImplementation: FetchImplementation = this.fetchImpl !== fetch ? 'injected-fetch'
      : Reflect.get(this.fetchImpl, Symbol.for('expo.builtin')) === true ? 'expo/fetch'
        : Reflect.get(this.fetchImpl, 'polyfill') === true ? 'react-native/whatwg-fetch' : 'global-fetch';
    return { status: response.status, body, headers: response.headers, responseType: response.type, fetchImplementation };
  }
}

export const fetchHttpClient: HttpMutationClient = new FetchHttpClient(getApiUrl);
