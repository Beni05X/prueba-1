const assert = require('node:assert/strict');
const { test } = require('node:test');
const { NextAuthSessionService } = require('@/modules/auth/services/next-auth-session-service');
const { FetchHttpClient } = require('@/services/api');
const { sessionCookies, storedCookieHeader } = require('@/modules/auth/adapters/next-auth-cookies');
const { sessionResponse } = require('@/modules/auth/adapters/auth-adapter');
const email = 'ana@example.invalid';
const session = () => ({ expires: new Date(Date.now() + 60000).toISOString(), user: { id: '7', email, name: 'Ana' } });
function json(body, status = 200, headers = {}) { return new Response(JSON.stringify(body), { status, headers }); }
function fixture(handler, web = false, initial = null) {
  let stored = initial;
  let csrfStored = null;
  const requests = [];
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    const path = new URL(url).pathname;
    requests.push({ path, options });
    return handler(path, options);
  });
  const storage = { isWeb: async () => web, read: async () => stored, write: async (value) => { stored = value; }, clear: async () => { stored = null; }, readCsrf: async () => csrfStored, writeCsrf: async (value) => { csrfStored = value; } };
  return { service: new NextAuthSessionService(http, storage, () => 'https://example.invalid'), requests, stored: () => stored, recreate: () => new NextAuthSessionService(http, storage, () => 'https://example.invalid') };
}
function accepted(path) {
  if (path === '/api/auth/providers') return json({ credentials: { id: 'credentials', type: 'credentials' } });
  if (path === '/api/auth/csrf') return json({ csrfToken: 'test-csrf' }, 200, { 'set-cookie': '__Host-authjs.csrf-token=test-csrf%7Cchecksum; Path=/; HttpOnly' });
  if (path === '/api/auth/callback/credentials') return json({ url: 'https://example.invalid' }, 200, { 'set-cookie': '__Secure-authjs.session-token=test-session; Path=/; HttpOnly' });
  if (path === '/api/auth/session') return json(session());
  if (path === '/api/usuario/perfil') return json({ nombre: 'Ana', correo: email });
  throw new Error('Unexpected endpoint');
}
test('native access preserves readable CSRF and session cookies AND confirms session/profile', async () => {
  const f = fixture(accepted);
  assert.equal((await f.service.signIn(email, 'test-password')).user.id, '7');
  assert.deepEqual(f.requests.map((r) => r.path), ['/api/auth/providers', '/api/auth/csrf', '/api/auth/callback/credentials', '/api/auth/session', '/api/usuario/perfil']);
  const callback = f.requests[2].options;
  assert.equal(callback.headers['X-Auth-Return-Redirect'], '1');
  assert.ok(callback.headers.Cookie.startsWith('__Host-authjs.csrf-token='));
  assert.equal(new URLSearchParams(callback.body).get('correo'), email);
  assert.ok(f.requests[4].options.headers.Cookie.includes('session-token='));
});
test('all backend credential rejections preserve their code without retries', async () => {
  for (const code of ['EMAIL_NOT_VERIFIED', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE', 'WRONG_PASSWORD', 'USER_NOT_FOUND']) {
    const f = fixture((path) => path === '/api/auth/callback/credentials' ? json({ error: `Error ${code}`, code }, 403) : accepted(path));
    await assert.rejects(f.service.signIn(email, 'test-password'), (error) => error.code === code && error.message === `Error ${code}`);
    assert.equal(f.requests.length, 3);
    assert.equal(f.requests.filter((r) => r.path === '/api/auth/credentials').length, 0);
    assert.equal(f.requests.filter((r) => r.path === '/api/auth/callback/credentials').length, 1);
    assert.equal(f.stored(), null);
  }
});
test('a callback URL without a confirmed server session cannot authenticate', async () => {
  const f = fixture((path) => path === '/api/auth/callback/credentials' ? json({ url: 'https://example.invalid' }) : path === '/api/auth/session' ? json({}) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'));
  assert.equal(f.stored(), null);
  assert.ok(!f.requests.some((r) => r.path === '/api/usuario/perfil'));
});
test('callback error URLs do not authenticate or trigger retries', async () => {
  const f = fixture((path) => path === '/api/auth/callback/credentials' ? json({ url: 'https://example.invalid/login?error=CallbackRouteError' }) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'), (error) => error.code === 'CallbackRouteError');
  assert.equal(f.stored(), null);
  assert.equal(f.requests.filter((r) => r.path.includes('credentials')).length, 1);
});
test('missing session, rejected profile and mismatched profile never authenticate', async () => {
  for (const variant of ['missing', 'unauthorized', 'mismatch']) {
    const f = fixture((path) => {
      if (path === '/api/auth/session' && variant === 'missing') return json(null);
      if (path === '/api/usuario/perfil' && variant === 'unauthorized') return json({ error: 'No autorizado' }, 401);
      if (path === '/api/usuario/perfil' && variant === 'mismatch') return json({ nombre: 'Otro', correo: 'otro@example.invalid' });
      return accepted(path);
    });
    await assert.rejects(f.service.signIn(email, 'test-password'));
    assert.equal(f.stored(), null);
  }
});
test('restore checks the server and propagates outages instead of trusting saved cookies', async () => {
  const raw = JSON.stringify({ '__Secure-authjs.session-token': 'test-session' });
  const restored = fixture(accepted, false, raw);
  assert.equal((await restored.service.restore()).user.email, email);
  assert.deepEqual(restored.requests.map((r) => r.path), ['/api/auth/session', '/api/usuario/perfil']);
  const failed = fixture(() => { throw new TypeError('Network failure'); }, false, raw);
  await assert.rejects(failed.service.restore());
  assert.equal(failed.stored(), raw);
  const expired = fixture(() => json(null), false, raw);
  assert.equal(await expired.service.restore(), null);
  assert.equal(expired.stored(), null);
});
test('cookie adapter handles chunks and rejects unsafe or expired cookies', () => {
  const headers = new Headers({ 'set-cookie': '__Secure-authjs.session-token.0=first; Path=/, __Secure-authjs.session-token.1=second; Path=/, authjs.session-token=; Max-Age=0' });
  assert.deepEqual(sessionCookies(headers), { '__Secure-authjs.session-token.0': 'first', '__Secure-authjs.session-token.1': 'second' });
  assert.equal(storedCookieHeader(JSON.stringify(sessionCookies(headers))), '__Secure-authjs.session-token.0=first; __Secure-authjs.session-token.1=second');
  for (const value of ['[]', '{"other":"value"}', '{"authjs.session-token":"a; injected=b"}', 'not json']) assert.equal(storedCookieHeader(value), null);
});
test('web uses browser cookies without persisting them and confirms session/profile', async () => {
  const f = fixture((path) => path === '/api/auth/csrf' ? json({ csrfToken: 'test-csrf' }) : accepted(path), true);
  assert.equal((await f.service.signIn(email, 'test-password')).user.id, '7');
  assert.equal(f.stored(), null);
  assert.ok(f.requests.every((r) => !('Cookie' in r.options.headers)));
  assert.ok(f.requests.every((r) => r.options.credentials === 'include'));
});
test('logout clears local storage and verifies that the server session disappeared', async () => {
  const f = fixture((path) => path === '/api/auth/session' ? json(null) : path === '/api/auth/signout' ? json({ url: 'https://example.invalid' }) : accepted(path), false, '{"authjs.session-token":"test-session"}');
  await f.service.signOut();
  assert.equal(f.stored(), null);
  assert.deepEqual(f.requests.map((r) => r.path), ['/api/auth/csrf', '/api/auth/signout', '/api/auth/session']);
  const stillActive = fixture((path) => path === '/api/auth/signout' ? json({ url: 'https://example.invalid' }) : accepted(path), false, '{"authjs.session-token":"test-session"}');
  await assert.rejects(stillActive.service.signOut());
  assert.equal(stillActive.stored(), null);
});
test('user JSON and expired/invalid NextAuth sessions never confirm access', () => {
  assert.throws(() => sessionResponse({ id: '7', email }));
  assert.equal(sessionResponse({}), null);
  assert.equal(sessionResponse({ expires: '2000-01-01T00:00:00Z', user: { id: '7', email } }), null);
  assert.throws(() => sessionResponse({ expires: new Date(Date.now() + 60000).toISOString(), user: {} }));
});

test('invalid provider configuration and CSRF cannot submit credentials', async () => {
  for (const variant of ['provider', 'csrf']) {
    const f = fixture((path) => path === '/api/auth/providers' && variant === 'provider' ? json({ google: { type: 'oauth' } }) : path === '/api/auth/csrf' && variant === 'csrf' ? json({}) : accepted(path));
    await assert.rejects(f.service.signIn(email, 'test-password'));
    assert.ok(!f.requests.some((r) => r.path === '/api/auth/callback/credentials'));
    assert.ok(!f.requests.some((r) => r.path === '/api/auth/credentials'));
  }
});

test('NextAuth 200 error URLs and specific codes are rejected before saving cookies', async () => {
  const f = fixture((path) => path === '/api/auth/callback/credentials' ? json({ url: 'https://example.invalid/login?error=CredentialsSignin&code=EMAIL_NOT_VERIFIED' }, 200, { 'set-cookie': '__Secure-authjs.session-token=test-session' }) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'), (error) => error.code === 'EMAIL_NOT_VERIFIED' && error.operation === 'Acceso' && error.status === 200);
  assert.equal(f.stored(), null);
  assert.equal(f.requests.filter((r) => r.path === '/api/auth/callback/credentials').length, 1);
});

test('a CSRF cookie cannot be stored as a session token', async () => {
  const f = fixture((path) => path === '/api/auth/callback/credentials' ? json({ url: 'https://example.invalid' }, 200, { 'set-cookie': '__Host-authjs.csrf-token=test-csrf%7Cchecksum' }) : path === '/api/auth/session' ? json({}) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'));
  assert.equal(f.stored(), null);
});

test('session renewal updates the cookie used for the protected profile', async () => {
  const f = fixture((path) => path === '/api/auth/session' ? json(session(), 200, { 'set-cookie': '__Secure-authjs.session-token.0=new-first; Path=/, __Secure-authjs.session-token.1=new-second; Path=/' }) : accepted(path), false, '{"__Secure-authjs.session-token":"old-test-session"}');
  await f.service.restore();
  const profile = f.requests.find((r) => r.path === '/api/usuario/perfil');
  assert.equal(profile.options.headers.Cookie, '__Secure-authjs.session-token.0=new-first; __Secure-authjs.session-token.1=new-second');
});

test('logout includes both session and CSRF cookies and rejects a NextAuth error response', async () => {
  const f = fixture((path) => path === '/api/auth/signout' ? json({ url: 'https://example.invalid/login?error=Configuration' }) : accepted(path), false, '{"authjs.session-token":"test-session"}');
  await assert.rejects(f.service.signOut(), (error) => error.operation === 'Cierre de sesión');
  assert.equal(f.requests[0].options.headers.Cookie, 'authjs.session-token=test-session');
  const logout = f.requests.find((r) => r.path === '/api/auth/signout');
  assert.ok(logout.options.headers.Cookie.includes('authjs.session-token=test-session'));
  assert.ok(logout.options.headers.Cookie.includes('__Host-authjs.csrf-token='));
  assert.equal(f.stored(), null);
});

test('change-password preserves its confirmed PUT contract and requires a native session', async () => {
  const f = fixture((path) => path === '/api/usuario/password' ? json({ ok: true }) : accepted(path), false, '{"authjs.session-token":"test-session"}');
  await f.service.changePassword('current-test', 'Nueva#2026');
  assert.equal(f.requests[0].options.method, 'PUT');
  assert.deepEqual(JSON.parse(f.requests[0].options.body), { passwordActual: 'current-test', passwordNueva: 'Nueva#2026' });
  const anonymous = fixture((path) => path === '/api/auth/session' ? json({}) : accepted(path));
  await assert.rejects(anonymous.service.changePassword('current-test', 'Nueva#2026'));
  assert.deepEqual(anonymous.requests.map((r) => r.path), ['/api/auth/session']);
});


test('native CSRF is preserved separately across service restarts and reused without a new Set-Cookie', async () => {
  let csrfRequests = 0;
  const f = fixture((path) => {
    if (path === '/api/auth/csrf' && ++csrfRequests > 1) return json({ csrfToken: 'test-csrf' });
    return accepted(path);
  });
  await f.service.signIn(email, 'test-password');
  const serviceAfterRestart = f.recreate();
  await serviceAfterRestart.signIn(email, 'test-password');
  assert.equal(f.requests.filter((r) => r.path === '/api/auth/callback/credentials').length, 2);
  assert.ok(f.requests.filter((r) => r.path === '/api/auth/callback/credentials').every((r) => r.options.headers.Cookie.includes('__Host-authjs.csrf-token=')));
  assert.ok(!(await serviceAfterRestart.cookieHeader()).includes('csrf-token'));
});

test('profile rejection after the callback reports the real endpoint and status', async () => {
  const f = fixture((path) => path === '/api/usuario/perfil' ? json({ error: 'No autorizado' }, 401) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'), (error) => error.operation === 'Acceso' && error.status === 401 && error.path === '/api/usuario/perfil');
  assert.equal(f.stored(), null);
});

test('native automatic cookies work when JavaScript cannot read CSRF or session Set-Cookie', async () => {
  // This models a cookie jar. It is not evidence of a real Android exchange.
  let jarHasCsrf = false;
  let jarHasSession = false;
  const f = fixture((path, options) => {
    if (path === '/api/auth/csrf') {
      jarHasCsrf = true;
      return json({ csrfToken: 'test-csrf' }, 200, { 'Content-Type': 'application/json' });
    }
    if (path === '/api/auth/callback/credentials') {
      assert.equal(jarHasCsrf, true);
      assert.equal(new URLSearchParams(options.body).get('csrfToken'), 'test-csrf');
      jarHasSession = true;
      return json({ url: 'https://example.invalid' });
    }
    if (path === '/api/auth/session') return json(jarHasSession ? session() : {});
    if (path === '/api/usuario/perfil') return jarHasSession ? accepted(path) : json({ error: 'No autorizado' }, 401);
    if (path === '/api/usuario/password') return jarHasSession ? json({ ok: true }) : json({ error: 'No autorizado' }, 401);
    if (path === '/api/auth/signout') {
      assert.equal(jarHasCsrf, true);
      jarHasSession = false;
      return json({ url: 'https://example.invalid' });
    }
    return accepted(path);
  });
  assert.equal((await f.service.signIn(email, 'test-password')).user.id, '7');
  assert.equal(f.stored(), null);
  assert.equal((await f.recreate().restore()).user.id, '7');
  await f.service.changePassword('current-test', 'Nueva#2026');
  await f.service.signOut();
  assert.equal(await f.service.restore(), null);
  assert.ok(f.requests.every((r) => !('Cookie' in r.options.headers)));
  assert.ok(f.requests.every((r) => r.options.credentials === 'include'));
});

test('an unreadable CSRF cookie does not prevent the callback, and backend CSRF errors are preserved', async () => {
  const f = fixture((path) => path === '/api/auth/csrf' ? json({ csrfToken: 'test-csrf' }) : path === '/api/auth/callback/credentials' ? json({ url: 'https://example.invalid/login?error=MissingCSRF' }) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'), (error) => error.code === 'MissingCSRF' && error.path === '/api/auth/callback/credentials');
  assert.equal(f.requests.filter((r) => r.path.includes('credentials')).length, 1);
  assert.equal(f.stored(), null);
});

test('visible mismatched CSRF is rejected before credentials are sent', async () => {
  const f = fixture((path) => path === '/api/auth/csrf' ? json({ csrfToken: 'test-csrf' }, 200, { 'set-cookie': '__Host-authjs.csrf-token=other%7Chash' }) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'), (error) => error.code === 'CSRF_MISMATCH' && error.path === '/api/auth/csrf');
  assert.ok(!f.requests.some((r) => r.path.includes('credentials')));
  assert.equal(f.service.csrfDiagnostics().matchesVisibleCookie, false);
});

test('callback also preserves the readable Auth.js callback cookie without Set-Cookie attributes', async () => {
  const f = fixture((path) => path === '/api/auth/csrf' ? json({ csrfToken: 'test-csrf' }, 200, { 'set-cookie': '__Host-authjs.csrf-token=test-csrf%7Cchecksum; HttpOnly; Secure; Path=/, __Secure-authjs.callback-url=https%3A%2F%2Fexample.invalid; Path=/' }) : accepted(path));
  await f.service.signIn(email, 'test-password');
  assert.equal(f.requests[2].options.headers.Cookie, '__Host-authjs.csrf-token=test-csrf%7Cchecksum; __Secure-authjs.callback-url=https%3A%2F%2Fexample.invalid');
});

test('web never attempts to read Set-Cookie, even when session responses have headers', async () => {
  const f = fixture((path) => {
    const response = path === '/api/auth/csrf' ? json({ csrfToken: 'test-csrf' }) : accepted(path);
    const get = response.headers.get.bind(response.headers);
    response.headers.get = (name) => {
      assert.notEqual(name.toLowerCase(), 'set-cookie');
      return get(name);
    };
    response.headers.getSetCookie = () => { throw new Error('Forbidden web cookie read'); };
    return response;
  }, true);
  await f.service.signIn(email, 'test-password');
  assert.ok(f.requests.every((r) => !('Cookie' in r.options.headers)));
  assert.equal(f.service.csrfDiagnostics().cookieHandling, 'browser');
});

test('anonymous CSRF probe confirms signout and exposes only safe metadata', async () => {
  const f = fixture((path) => path === '/api/auth/session' ? json({}) : path === '/api/auth/signout' ? json({ url: 'https://example.invalid' }) : path === '/api/auth/csrf' ? json({ csrfToken: 'test-csrf' }, 200, { 'Content-Type': 'application/json', 'set-cookie': '__Host-authjs.csrf-token=test-csrf%7Cchecksum; HttpOnly; Path=/' }) : accepted(path));
  const result = await f.service.verifyCsrfTransport();
  assert.equal(result.signoutStatus, 200);
  assert.equal(result.csrf.csrfTokenPresent, true);
  assert.equal(result.csrf.matchesVisibleCookie, true);
  assert.deepEqual(result.csrf.visibleCookieNames, ['__Host-authjs.csrf-token']);
  assert.equal(result.csrf.contentType, 'application/json');
  for (const secret of ['test-csrf', 'checksum', 'test-password']) assert.ok(!JSON.stringify(result).includes(secret));
  assert.deepEqual(f.requests.map((r) => r.path), ['/api/auth/session', '/api/auth/csrf', '/api/auth/signout']);
  const active = fixture(accepted);
  await assert.rejects(active.service.verifyCsrfTransport(), (error) => error.code === 'CSRF_PROBE_REQUIRES_ANONYMOUS');
  assert.deepEqual(active.requests.map((r) => r.path), ['/api/auth/session']);
});

test('an automatic session for a different account cannot confirm this login', async () => {
  const f = fixture((path) => path === '/api/auth/session' ? json({ ...session(), user: { id: '8', email: 'other@example.invalid' } }) : path === '/api/usuario/perfil' ? json({ nombre: 'Otro', correo: 'other@example.invalid' }) : accepted(path));
  await assert.rejects(f.service.signIn(email, 'test-password'), (error) => error.code === 'SESSION_USER_MISMATCH');
  assert.equal(f.stored(), null);
});
