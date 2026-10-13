const assert = require('node:assert/strict');
const { test } = require('node:test');
const { FetchHttpClient, HttpError, setAuthRequestHooks } = require('@/services/api');
const { AdapterError } = require('@/shared/adapters/adapter-error');

function clientReturning(response) {
  return new FetchHttpClient(() => 'https://api.example.test', async () => response);
}

test('HTTP joins the configured URL and preserves list/envelope responses for endpoint adapters', async () => {
  const payload = { data: [{ id: 7, nombre: 'Servicio' }], total: 1 };
  let request;
  const client = new FetchHttpClient(() => 'https://api.example.test', async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify(payload), { status: 200 });
  });

  assert.deepEqual(await client.get('/api/servicios'), payload);
  assert.equal(request.url, 'https://api.example.test/api/servicios');
  assert.equal(request.options.method, 'GET');
  assert.deepEqual(await clientReturning(new Response('[]')).get('/api/productos'), []);
});

test('HTTP exposes a confirmed empty 204 response as null', async () => {
  assert.equal(await clientReturning(new Response(null, { status: 204 })).get('/api/servicios'), null);
  assert.equal(await clientReturning(new Response('', { status: 200 })).get('/api/servicios'), null);
});

test('HTTP preserves authentication failures and JSON error bodies', async () => {
  const payload = { message: 'Unauthenticated.' };
  await assert.rejects(
    clientReturning(new Response(JSON.stringify(payload), { status: 401 })).get('/api/cuenta'),
    (error) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 401);
      assert.equal(error.path, '/api/cuenta');
      assert.deepEqual(error.body, payload);
      assert.ok(!(error instanceof AdapterError));
      return true;
    },
  );
});

test('HTTP sends the secured NextAuth cookie and clears session state after a protected 401', async () => {
  let cookieSent;
  let cleared = 0;
  let expired = 0;
  setAuthRequestHooks({ cookieHeader: async () => '__Secure-authjs.session-token=opaque', clear: async () => { cleared += 1; }, onExpired: () => { expired += 1; } });
  try {
    const client = new FetchHttpClient(() => 'https://api.example.test', async (_url, options) => {
      cookieSent = options.headers.Cookie;
      return new Response('{"error":"No autorizado"}', { status: 401 });
    });
    await assert.rejects(client.get('/api/usuario/perfil'), (error) => error instanceof HttpError && error.status === 401);
    assert.equal(cookieSent, '__Secure-authjs.session-token=opaque');
    assert.equal(cleared, 1);
    assert.equal(expired, 1);
  } finally {
    setAuthRequestHooks(null);
  }
});

test('HTTP preserves non-JSON HTTP errors without masking status as a transformation error', async () => {
  const html = '<html><body>Forbidden</body></html>';
  await assert.rejects(
    clientReturning(new Response(html, { status: 403 })).get('/api/cuenta'),
    (error) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 403);
      assert.equal(error.body, html);
      return true;
    },
  );
});

test('HTTP rejects successful malformed JSON as AdapterError', async () => {
  for (const text of ['<html>Unexpected successful HTML</html>', '{']) {
    await assert.rejects(clientReturning(new Response(text, { status: 200 })).get('/api/productos'), AdapterError);
  }
});

test('HTTP forwards cancellation and preserves the original fetch abort', async () => {
  const controller = new AbortController();
  const abortError = new DOMException('The request was aborted', 'AbortError');
  const client = new FetchHttpClient(() => 'https://api.example.test', async (_url, options) => {
    assert.equal(options.signal, controller.signal);
    throw abortError;
  });
  controller.abort();
  await assert.rejects(client.get('/api/productos', { signal: controller.signal }), (error) => error === abortError);
});

test('HTTP preserves transport failures for ViewModel error states', async () => {
  const transportError = new TypeError('Network request failed');
  const client = new FetchHttpClient(() => 'https://api.example.test', async () => {
    throw transportError;
  });
  await assert.rejects(client.get('/api/productos'), (error) => error === transportError);
});

test('HTTP does not send requests to arbitrary external URLs', async () => {
  let requested = false;
  const client = new FetchHttpClient(() => 'https://api.example.test', async () => {
    requested = true;
    return new Response('{}');
  });
  await assert.rejects(client.get('https://other.example.test/api/productos'));
  assert.equal(requested, false);
});

test('protected HTML 401 clears session state before JSON error handling', async () => {
  let cleared = 0;
  let expired = 0;
  setAuthRequestHooks({ cookieHeader: async () => 'authjs.session-token=test-session', clear: async () => { cleared++; }, onExpired: () => { expired++; } });
  try {
    await assert.rejects(clientReturning(new Response('<html>No autorizado</html>', { status: 401 })).get('/api/usuario/perfil'), (error) => error instanceof HttpError && error.status === 401);
    assert.equal(cleared, 1);
    assert.equal(expired, 1);
  } finally { setAuthRequestHooks(null); }
});

