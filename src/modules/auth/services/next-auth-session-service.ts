import { getApiUrl } from '@/config/api';
import { fetchHttpClient, HttpError, type FetchImplementation, type HttpMutationClient } from '@/services/api';
import { confirmarOk, confirmarPerfil, sessionResponse } from '../adapters/auth-adapter';
import { confirmarProveedor, confirmarCallback } from '../adapters/next-auth-callback';
import { callbackCookie, cookieNames, csrfCookie, sessionCookies, storedCookieHeader, storedCsrfPair } from '../adapters/next-auth-cookies';
import { AuthError } from '../models/auth-error';
import { authError } from '../adapters/auth-error-adapter';
import type { NextAuthSession } from '../models/autenticacion';
import { sessionCookieStorage, type SessionCookieStorage } from './session-cookie-storage';
import { perfilResponse } from '@/modules/perfil/adapters/perfil-adapter';

export type { NextAuthSession } from '../models/autenticacion';

export type CsrfDiagnostics = Readonly<{
  platform: string;
  fetchImplementation: FetchImplementation | 'browser' | 'unknown';
  status: number;
  responseType: string;
  contentType: string | null;
  csrfTokenPresent: boolean;
  visibleCookieNames: readonly string[];
  matchesVisibleCookie: boolean | null;
  cookieHandling: 'browser' | 'native-readable' | 'native-automatic';
}>;

export class NextAuthSessionService {
  private lastCsrfDiagnostics: CsrfDiagnostics | null = null;
  constructor(
    private readonly http: HttpMutationClient = fetchHttpClient,
    private readonly storage: SessionCookieStorage = sessionCookieStorage,
    private readonly baseUrl: () => string = getApiUrl,
  ) {}

  async cookieHeader(): Promise<string | null> {
    if (await this.storage.isWeb()) return null;
    const raw = await this.storage.read();
    if (!raw) return null;
    const cookie = storedCookieHeader(raw);
    if (!cookie) await this.clear();
    return cookie;
  }

  async restore(options?: { reportRejection?: boolean; signal?: AbortSignal }): Promise<NextAuthSession | null> {
    const web = await this.storage.isWeb();
    const cookie = await this.cookieHeader();
    try {
      const response = await this.http.request('/api/auth/session', { authenticated: false, signal: options?.signal, headers: cookie ? { Cookie: cookie } : undefined });
      if (options?.signal?.aborted) throw new Error('La consulta de sesión fue cancelada.');
      const session = sessionResponse(response.body);
      if (!session) { await this.clear(); return null; }
      const refreshed = web ? {} : sessionCookies(response.headers);
      if (!web && Object.keys(refreshed).length) await this.storage.write(JSON.stringify(refreshed));
      const refreshedCookie = await this.cookieHeader() ?? cookie;
      const profile = await this.http.request('/api/usuario/perfil', { authenticated: false, signal: options?.signal, headers: refreshedCookie ? { Cookie: refreshedCookie } : undefined });
      if (options?.signal?.aborted) throw new Error('La consulta de sesión fue cancelada.');
      confirmarPerfil(profile.body, session);
      const perfil = perfilResponse(profile.body);
      return { ...session, user: { ...session.user, name: perfil.nombre, telefono: perfil.telefono } };
    } catch (error) {
      if (options?.signal?.aborted) throw error;
      if (error instanceof HttpError && [401, 403, 404].includes(error.status)) {
        await this.clear();
        if (options?.reportRejection) throw authError(error, 'Acceso');
        return null;
      }
      // Una caída de red no convierte un usuario guardado en una sesión confirmada.
      throw authError(error, 'Consulta de sesión');
    }
  }

  async signIn(email: string, password: string): Promise<NextAuthSession> {
    try {
      const providers = await this.http.request('/api/auth/providers', { authenticated: false });
      confirmarProveedor(providers.body);
      await this.clear();
      const csrf = await this.csrf();
      const form = new URLSearchParams({ csrfToken: csrf.token, correo: email.trim(), password, callbackUrl: this.baseUrl() });
      const response = await this.http.request('/api/auth/callback/credentials', {
        method: 'POST', authenticated: false,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1', ...(csrf.cookie ? { Cookie: csrf.cookie } : {}) },
        body: form.toString(),
      });
      confirmarCallback(response.body, response.status, '/api/auth/callback/credentials', this.baseUrl());
      if (!await this.storage.isWeb()) {
        const cookies = sessionCookies(response.headers);
        if (Object.keys(cookies).length) await this.storage.write(JSON.stringify(cookies));
      }
      const session = await this.restore({ reportRejection: true });
      if (!session) throw new AuthError('No fue posible confirmar tu sesión y perfil.');
      if (session.user.email.toLowerCase() !== email.trim().toLowerCase()) throw new AuthError('La sesión confirmada no corresponde al correo ingresado.', 'SESSION_USER_MISMATCH');
      return session;
    } catch (error) { await this.clear(); throw authError(error, 'Acceso'); }
  }

  async signOut(): Promise<void> {
    const sessionCookie = await this.cookieHeader();
    try {
      const csrf = await this.csrf(sessionCookie);
      const logout = await this.http.request('/api/auth/signout', {
        method: 'POST', authenticated: false,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1', ...(sessionCookie || csrf.cookie ? { Cookie: [sessionCookie, csrf.cookie].filter(Boolean).join('; ') } : {}) },
        body: new URLSearchParams({ csrfToken: csrf.token, callbackUrl: this.baseUrl() }).toString(),
      });
      confirmarCallback(logout.body, logout.status, '/api/auth/signout', this.baseUrl());
      await this.clear();
      // Usa el almacén de cookies de la plataforma para verificar que el logout se aplicó.
      const after = await this.http.request('/api/auth/session', { authenticated: false });
      if (sessionResponse(after.body)) throw new AuthError('La sesión local se cerró, pero el servidor todavía mantiene una sesión. Intenta cerrar sesión otra vez.');
    } catch (error) { throw authError(error, 'Cierre de sesión'); }
    finally { await this.clear(); }
  }

  async changePassword(passwordActual: string, passwordNueva: string): Promise<void> {
    const cookie = await this.cookieHeader();
    try {
      if (!await this.storage.isWeb() && !cookie && !await this.restore()) throw new AuthError('Inicia sesión para cambiar tu contraseña.');
      const result = await this.http.request('/api/usuario/password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify({ passwordActual, passwordNueva }),
      });
      confirmarOk(result.body);
    } catch (error) { throw authError(error, 'Cambio de contraseña'); }
  }

  async clear(): Promise<void> { await this.storage.clear(); }

  /** Contains metadata only, never tokens, cookie values or request bodies. */
  csrfDiagnostics(): CsrfDiagnostics | null {
    return this.lastCsrfDiagnostics ? { ...this.lastCsrfDiagnostics, visibleCookieNames: [...this.lastCsrfDiagnostics.visibleCookieNames] } : null;
  }

  /** Run inside the app, without credentials. Refuses to sign out an existing session. */
  async verifyCsrfTransport(): Promise<{ csrf: CsrfDiagnostics; signoutStatus: number }> {
    if (await this.cookieHeader()) throw new AuthError('El diagnóstico CSRF requiere una sesión anónima.', 'CSRF_PROBE_REQUIRES_ANONYMOUS');
    const before = await this.http.request('/api/auth/session', { authenticated: false });
    if (sessionResponse(before.body)) throw new AuthError('El diagnóstico CSRF requiere una sesión anónima.', 'CSRF_PROBE_REQUIRES_ANONYMOUS');
    const csrf = await this.csrf();
    const result = await this.http.request('/api/auth/signout', {
      method: 'POST', authenticated: false,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1', ...(csrf.cookie ? { Cookie: csrf.cookie } : {}) },
      body: new URLSearchParams({ csrfToken: csrf.token, callbackUrl: this.baseUrl() }).toString(),
    });
    confirmarCallback(result.body, result.status, '/api/auth/signout', this.baseUrl());
    return { csrf: this.csrfDiagnostics()!, signoutStatus: result.status };
  }

  private async csrf(sessionCookie?: string | null): Promise<{ token: string; cookie: string | null }> {
    this.lastCsrfDiagnostics = null;
    const web = await this.storage.isWeb();
    const saved = web ? null : await this.storage.readCsrf?.() ?? null;
    // Preserve server-issued pairs when readable; otherwise credentials: include
    // lets Expo/React Native's native cookie jar (or the browser) handle the exchange.
    const savedHeader = web ? '' : [sessionCookie, saved?.cookie].filter(Boolean).join('; ');
    const headers = savedHeader ? { Cookie: savedHeader } : undefined;
    const response = await this.http.request('/api/auth/csrf', { authenticated: false, headers });
    const value = response.body;
    const token = typeof value === 'object' && value !== null && 'csrfToken' in value ? value.csrfToken : null;
    const visibleCookie = web ? null : csrfCookie(response.headers);
    const cookie = visibleCookie ?? (saved && saved.token === token ? saved.cookie : null);
    const tokenPresent = typeof token === 'string' && !!token;
    const pair = tokenPresent && cookie ? storedCsrfPair(JSON.stringify({ token, cookie })) : null;
    this.lastCsrfDiagnostics = {
      platform: await this.storage.platform?.() ?? (web ? 'web' : 'native'),
      fetchImplementation: web ? 'browser' : response.fetchImplementation ?? 'unknown', status: response.status,
      responseType: response.responseType ?? 'unknown', contentType: response.headers.get('content-type'),
      csrfTokenPresent: tokenPresent, visibleCookieNames: web ? [] : cookieNames(response.headers),
      matchesVisibleCookie: visibleCookie ? !!pair : null,
      cookieHandling: web ? 'browser' : cookie ? 'native-readable' : 'native-automatic',
    };
    if (!tokenPresent) throw new AuthError('La respuesta no contiene un token CSRF válido.', 'CSRF_NOT_CONFIRMED', response.status, '/api/auth/csrf');
    if (!web && cookie) {
      if (!pair) throw new AuthError('El token CSRF no coincide con la cookie recibida.', 'CSRF_MISMATCH', response.status, '/api/auth/csrf');
      await this.storage.writeCsrf?.(pair);
    }
    const callback = web || !cookie ? null : callbackCookie(response.headers);
    return { token, cookie: cookie ? [cookie, callback].filter(Boolean).join('; ') : null };
  }
}
export const nextAuthSessionService = new NextAuthSessionService();
