import { storedCsrfPair, type CsrfPair } from '../adapters/next-auth-cookies';

const SESSION_KEY = 'brenns.auth.nextauth.cookies.v1';
const CSRF_KEY = 'brenns.auth.nextauth.csrf.v1';
export interface SessionCookieStorage {
  isWeb(): Promise<boolean>;
  platform?(): Promise<string>;
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
  clear(): Promise<void>;
  readCsrf?(): Promise<CsrfPair | null>;
  writeCsrf?(value: CsrfPair): Promise<void>;
}

// La cookie CSRF no autentica: se guarda aparte y no participa en cookieHeader().
export const sessionCookieStorage: SessionCookieStorage = {
  async platform() { return (await import('react-native')).Platform.OS; },
  async isWeb() { return (await import('react-native')).Platform.OS === 'web'; },
  async read() { return await this.isWeb() ? null : (await import('expo-secure-store')).getItemAsync(SESSION_KEY); },
  async write(value) { if (!await this.isWeb()) await (await import('expo-secure-store')).setItemAsync(SESSION_KEY, value); },
  async clear() { if (!await this.isWeb()) await (await import('expo-secure-store')).deleteItemAsync(SESSION_KEY); },
  async readCsrf() {
    if (await this.isWeb()) return null;
    const secure = await import('expo-secure-store');
    const raw = await secure.getItemAsync(CSRF_KEY);
    const pair = raw ? storedCsrfPair(raw) : null;
    if (raw && !pair) await secure.deleteItemAsync(CSRF_KEY);
    return pair;
  },
  async writeCsrf(value) { if (!await this.isWeb()) await (await import('expo-secure-store')).setItemAsync(CSRF_KEY, JSON.stringify(value)); },
};
