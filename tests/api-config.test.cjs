const assert = require('node:assert/strict');
const { test } = require('node:test');
const { getApiUrl } = require('@/config/api');
const { FetchHttpClient } = require('@/services/api');

async function withUrl(value, action) {
  const previous = process.env.EXPO_PUBLIC_API_URL;
  try {
    if (value === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = value;
    await action();
  } finally {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = previous;
  }
}

test('API configuration preserves the configured HTTP(S) origin and trims trailing slashes', async () => {
  for (const [value, expected] of [
    [' https://api.example.test/// ', 'https://api.example.test'],
    ['http://api.example.test:8080', 'http://api.example.test:8080'],
  ]) await withUrl(value, () => assert.equal(getApiUrl(), expected));
});

test('missing or malformed configuration fails before fetch without a fallback URL', async () => {
  for (const value of [undefined, '', '  ', 'api.example.test', 'ftp://api.example.test',
    'https://', 'https://api example.test', 'https://api.example.test/api',
    'https://api.example.test?env=prod', 'https://api.example.test#fragment',
    'https://user:password@api.example.test', 'https://api.example.test:invalid']) {
    await withUrl(value, async () => {
      let fetched = false;
      const client = new FetchHttpClient(getApiUrl, async () => { fetched = true; return new Response('[]'); });
      await assert.rejects(client.get('/api/productos'), /EXPO_PUBLIC_API_URL/);
      assert.equal(fetched, false);
    });
  }
});
