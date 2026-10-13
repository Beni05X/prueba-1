import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { nextAuthSessionService, type NextAuthSession } from '@/modules/auth/services/next-auth-session-service';
import { authError, authErrorMessage } from '@/modules/auth/adapters/auth-error-adapter';
import { setAuthRequestHooks } from '@/services/api';
import { SessionTransitions } from './session-transitions';

type AuthSessionContextValue = {
  session: NextAuthSession | null;
  status: 'loading' | 'anonymous' | 'authenticated';
  error: string | null;
  sessionRevision: number;
  dataRevision: number;
  refreshData(): number;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  changePassword(passwordActual: string, passwordNueva: string): Promise<void>;
};
const Context = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<NextAuthSession | null>(null);
  const [status, setStatus] = useState<AuthSessionContextValue['status']>('loading');
  const [error, setError] = useState<string | null>(null);
  const currentStatus = useRef(status);
  const revision = useRef(0);
  const restoration = useRef<AbortController | null>(null);
  const transitions = useMemo(() => new SessionTransitions(), []);
  const [sessionRevision, setSessionRevision] = useState(0);
  const [dataRevision, setDataRevision] = useState(0);
  const dataVersion = useRef(0);
  const refreshData = useCallback(() => { const value = ++dataVersion.current; setDataRevision(value); return value; }, []);
  const publish = useCallback((value: NextAuthSession | null) => {
    currentStatus.current = value ? 'authenticated' : 'anonymous';
    setSession(value);
    setStatus(currentStatus.current);
    setSessionRevision(revision.current);
  }, []);
  const invalidate = useCallback(() => {
    revision.current += 1;
    publish(null);
    setError('Inicia sesión de nuevo para continuar.');
    void nextAuthSessionService.clear().catch(() => {});
  }, [publish]);
  useEffect(() => {
    let active = true;
    const version = revision.current;
    const controller = new AbortController();
    restoration.current = controller;
    setAuthRequestHooks({ cookieHeader: () => currentStatus.current === 'authenticated' ? nextAuthSessionService.cookieHeader() : Promise.resolve(null), clear: () => nextAuthSessionService.clear(), onExpired: invalidate, sessionKey: () => currentStatus.current === 'authenticated' ? String(revision.current) : null });
    void nextAuthSessionService.restore({ signal: controller.signal }).then((restored) => {
      if (active && revision.current === version) publish(restored);
    }).catch((failure) => {
      if (active && revision.current === version) { publish(null); setError(authErrorMessage(authError(failure))); }
    });
    return () => { active = false; controller.abort(); setAuthRequestHooks(null); };
  }, [invalidate, publish]);

  const signIn = useCallback(async (email: string, password: string) => {
    const version = ++revision.current;
    restoration.current?.abort();
    publish(null);
    setError(null);
    try {
      await transitions.run(async () => {
        if (revision.current !== version) throw new Error('La solicitud de acceso fue cancelada.');
        const signedIn = await nextAuthSessionService.signIn(email, password);
        if (revision.current !== version) throw new Error('La solicitud de acceso fue cancelada.');
        publish(signedIn);
      });
    } catch (failure) {
      if (revision.current === version) publish(null);
      throw failure;
    }
  }, [publish, transitions]);
  const signOut = useCallback(async () => {
    restoration.current?.abort();
    const version = ++revision.current;
    publish(null);
    setError(null);
    try { await transitions.run(() => nextAuthSessionService.signOut()); }
    catch (failure) { if (revision.current === version) setError(authErrorMessage(authError(failure))); throw failure; }
    finally { if (revision.current === version) publish(null); }
  }, [publish, transitions]);
  const changePassword = useCallback(async (current: string, next: string) => {
    await nextAuthSessionService.changePassword(current, next);
  }, []);
  const value = useMemo(() => ({ session, status, error, signIn, signOut, changePassword, sessionRevision, dataRevision, refreshData }), [session, status, error, signIn, signOut, changePassword, sessionRevision, dataRevision, refreshData]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuthSession() {
  const value = useContext(Context);
  if (!value) throw new Error('useAuthSession debe usarse dentro de AuthSessionProvider.');
  return value;
}
