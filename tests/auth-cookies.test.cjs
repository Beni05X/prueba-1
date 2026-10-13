const assert = require('node:assert/strict');
const { test } = require('node:test');
const { Headers: NativeHeaders } = require('whatwg-fetch');
const { cookieLines, cookieNames, csrfCookie, callbackCookie, sessionCookies, storedCookieHeader, storedCsrfPair } = require('@/modules/auth/adapters/next-auth-cookies');

test('Auth.js v5 HTTPS names keep CSRF, callback and session roles separate', () => {
  const headers = new NativeHeaders({ 'set-cookie': '__Host-authjs.csrf-token=nonce%7Chash; HttpOnly; Secure; Path=/, __Secure-authjs.callback-url=https%3A%2F%2Fexample.invalid; Secure; Path=/, __Secure-authjs.session-token=opaque; HttpOnly; Secure; Path=/' });
  assert.equal(csrfCookie(headers), '__Host-authjs.csrf-token=nonce%7Chash');
  assert.equal(callbackCookie(headers), '__Secure-authjs.callback-url=https%3A%2F%2Fexample.invalid');
  assert.deepEqual(sessionCookies(headers), { '__Secure-authjs.session-token': 'opaque' });
  assert.deepEqual(cookieNames(headers), ['__Host-authjs.csrf-token', '__Secure-authjs.callback-url', '__Secure-authjs.session-token']);
  assert.equal(storedCookieHeader(JSON.stringify(sessionCookies(headers))), '__Secure-authjs.session-token=opaque');
  assert.equal(csrfCookie(new NativeHeaders({ 'set-cookie': '__Secure-authjs.csrf-token=nonce%7Chash' })), null);
});

test('local CSRF comparison decodes token|hash but preserves the complete server value', () => {
  for (const cookie of ['__Host-authjs.csrf-token=nonce%7Chash', '__Host-authjs.csrf-token=nonce|hash', '__Host-authjs.csrf-token="nonce%7Chash"']) {
    assert.deepEqual(storedCsrfPair(JSON.stringify({ token: 'nonce', cookie })), { token: 'nonce', cookie });
  }
  const cookie = '__Host-authjs.csrf-token=a%2Bb%7Chash';
  assert.deepEqual(storedCsrfPair(JSON.stringify({ token: 'a+b', cookie })), { token: 'a+b', cookie });
  for (const value of ['other%7Chash', 'nonce', 'nonce%7C', 'nonce%7Chash%7Cextra', '%zz', 'nonce%7Chash; injected=value', 'nonce%7Chash\r\n']) {
    assert.equal(storedCsrfPair(JSON.stringify({ token: 'nonce', cookie: `__Host-authjs.csrf-token=${value}` })), null);
  }
});

test('combined Set-Cookie respects Expires, quoted commas and unrelated cookies', () => {
  const combined = 'load-balancer="a, b=c"; Path=/, __Host-authjs.csrf-token=nonce%7Chash; Expires=Wed, 09 Jun 2038 10:18:14 GMT; Path=/, other=x; Path=/, __Secure-authjs.session-token.0=first; Path=/, __Secure-authjs.session-token.1=second; Path=/';
  const headers = new NativeHeaders({ 'set-cookie': combined });
  assert.equal(cookieLines(headers).length, 5);
  assert.ok(cookieLines(headers)[1].includes('Wed, 09 Jun 2038'));
  assert.equal(csrfCookie(headers), '__Host-authjs.csrf-token=nonce%7Chash');
  assert.deepEqual(sessionCookies(headers), { '__Secure-authjs.session-token.0': 'first', '__Secure-authjs.session-token.1': 'second' });
  assert.ok(!storedCookieHeader(JSON.stringify(sessionCookies(headers))).includes('Path'));
});

test('Set-Cookie arrays and empty getSetCookie fallback both extract every cookie', () => {
  const lines = ['__Host-authjs.csrf-token=nonce%7Chash; Path=/', '__Secure-authjs.session-token=opaque; Expires=Wed, 09 Jun 2038 10:18:14 GMT'];
  assert.deepEqual(cookieLines({ getSetCookie: () => lines, get: () => null }), lines);
  assert.deepEqual(cookieLines({ getSetCookie: () => [], get: () => lines.join(', ') }), lines);
  assert.deepEqual(cookieLines({ get: () => null }), []);
});

test('production CSRF takes priority over a legacy cookie and deleted cookies are excluded', () => {
  const headers = new NativeHeaders({ 'set-cookie': 'next-auth.csrf-token=old%7Chash; Path=/, __Host-authjs.csrf-token=nonce%7Chash; Path=/, __Secure-authjs.session-token=deleted; Max-Age=0; Path=/, authjs.session-token=old; Expires=Wed, 09 Jun 2000 10:18:14 GMT; Path=/' });
  assert.equal(csrfCookie(headers), '__Host-authjs.csrf-token=nonce%7Chash');
  assert.deepEqual(sessionCookies(headers), {});
});
